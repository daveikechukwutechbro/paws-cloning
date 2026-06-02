import { db } from '@/utils/firebaseClient'
import { doc, getDoc, setDoc, increment, Timestamp, runTransaction, collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore'

export type TaskAttemptStatus = 'started' | 'redirected' | 'proof_pending' | 'verified' | 'rewarded' | 'rejected' | 'expired'

export type VerificationMethod = 'return_signal'

export interface TaskAttempt {
    id: string
    userId: string
    taskId: string
    status: TaskAttemptStatus
    verificationMethod: VerificationMethod
    rewardAmount: number
    idempotencyKey: string
    platform: string
    targetUrl: string
    startedAt: Timestamp
    redirectedAt?: Timestamp
    verifiedAt?: Timestamp
    rewardedAt?: Timestamp
    rejectedAt?: Timestamp
    rejectionReason?: string
    expiresAt?: Timestamp
}

export interface TaskRewardLedgerEntry {
    id: string
    userId: string
    taskId: string
    taskAttemptId: string
    amount: number
    status: 'completed' | 'failed'
    idempotencyKey: string
    createdAt: Timestamp
    errorMessage?: string
}

export interface SocialTaskStatus {
    taskId: string
    status: 'available' | 'started' | 'redirected' | 'proof_pending' | 'verified' | 'rewarded' | 'rejected' | 'expired'
    attemptId: string | null
    rewarded: boolean
}

const ATTEMPT_PREFIX = 'attempt_'
const REWARD_LEDGER_PREFIX = 'soc_reward_'

function generateIdempotencyKey(userId: string, taskId: string): string {
    return `task_reward_${userId}_${taskId}`
}

function generateAttemptId(userId: string, taskId: string): string {
    return `${ATTEMPT_PREFIX}${userId}_${taskId}`
}

function generateLedgerId(idempotencyKey: string): string {
    return `${REWARD_LEDGER_PREFIX}${idempotencyKey}`
}

export async function getTaskStatus(userId: string, taskId: string): Promise<SocialTaskStatus> {
    const attemptId = generateAttemptId(userId, taskId)
    const attemptRef = doc(db, 'task_attempts', attemptId)
    const attemptSnap = await getDoc(attemptRef)

    if (!attemptSnap.exists()) {
        return { taskId, status: 'available', attemptId: null, rewarded: false }
    }

    const data = attemptSnap.data() as TaskAttempt
    return {
        taskId,
        status: data.status,
        attemptId: data.id,
        rewarded: data.status === 'rewarded',
    }
}

export async function getAllTaskStatuses(userId: string, taskIds: string[]): Promise<Record<string, SocialTaskStatus>> {
    const result: Record<string, SocialTaskStatus> = {}

    for (const taskId of taskIds) {
        result[taskId] = await getTaskStatus(userId, taskId)
    }

    return result
}

export async function startSocialTask(
    userId: string,
    taskId: string,
    rewardAmount: number,
    platform: string,
    targetUrl: string,
): Promise<{ success: boolean; error?: string; attemptId?: string }> {
    if (!userId || !taskId) {
        return { success: false, error: 'Invalid parameters' }
    }

    const attemptId = generateAttemptId(userId, taskId)
    const idempotencyKey = generateIdempotencyKey(userId, taskId)

    try {
        await runTransaction(db, async (transaction) => {
            const attemptRef = doc(db, 'task_attempts', attemptId)
            const attemptSnap = await transaction.get(attemptRef)

            if (attemptSnap.exists()) {
                const existing = attemptSnap.data() as TaskAttempt
                if (existing.status === 'rewarded') {
                    throw new Error('Task already completed and rewarded')
                }
                if (existing.status === 'started' || existing.status === 'redirected' || existing.status === 'proof_pending') {
                    return
                }
            }

            const newAttempt: Omit<TaskAttempt, 'id'> = {
                userId,
                taskId,
                status: 'started',
                verificationMethod: 'return_signal',
                rewardAmount,
                idempotencyKey,
                platform,
                targetUrl,
                startedAt: Timestamp.now(),
            }

            transaction.set(attemptRef, newAttempt)
        })

        return { success: true, attemptId }
    } catch (error: any) {
        console.error('startSocialTask failed:', error)
        return { success: false, error: error.message || 'Failed to start task' }
    }
}

export async function markRedirected(
    userId: string,
    taskId: string,
): Promise<{ success: boolean; error?: string }> {
    const attemptId = generateAttemptId(userId, taskId)

    try {
        await runTransaction(db, async (transaction) => {
            const attemptRef = doc(db, 'task_attempts', attemptId)
            const attemptSnap = await transaction.get(attemptRef)

            if (!attemptSnap.exists()) {
                throw new Error('No task attempt found')
            }

            const data = attemptSnap.data() as TaskAttempt
            if (data.status !== 'started') {
                return
            }

            transaction.update(attemptRef, {
                status: 'redirected',
                redirectedAt: Timestamp.now(),
            })
        })

        return { success: true }
    } catch (error: any) {
        console.error('markRedirected failed:', error)
        return { success: false, error: error.message || 'Failed to update task' }
    }
}

export async function verifyAndReward(
    userId: string,
    taskId: string,
): Promise<{ success: boolean; error?: string; rewarded: boolean }> {
    const attemptId = generateAttemptId(userId, taskId)

    try {
        const result = await runTransaction(db, async (transaction) => {
            const attemptRef = doc(db, 'task_attempts', attemptId)
            const attemptSnap = await transaction.get(attemptRef)

            if (!attemptSnap.exists()) {
                return { success: false, error: 'No task attempt found. Start the task first.', rewarded: false }
            }

            const data = attemptSnap.data() as TaskAttempt

            if (data.status === 'rewarded') {
                return { success: true, error: undefined, rewarded: true }
            }

            if (data.status === 'rejected' || data.status === 'expired') {
                return { success: false, error: `Task is ${data.status} and cannot be rewarded`, rewarded: false }
            }

            if (data.status === 'available') {
                return { success: false, error: 'Task not started', rewarded: false }
            }

            const idempotencyKey = generateIdempotencyKey(userId, taskId)
            const ledgerId = generateLedgerId(idempotencyKey)
            const ledgerRef = doc(db, 'task_reward_ledger', ledgerId)
            const ledgerSnap = await transaction.get(ledgerRef)

            if (ledgerSnap.exists()) {
                return { success: true, error: undefined, rewarded: true }
            }

            const statusTransition: TaskAttemptStatus =
                data.status === 'redirected' || data.status === 'proof_pending' || data.status === 'started'
                    ? 'verified'
                    : data.status

            if (statusTransition === 'verified') {
                transaction.update(attemptRef, {
                    status: 'verified',
                    verifiedAt: Timestamp.now(),
                })
            }

            const rewardAmount = data.rewardAmount

            transaction.update(attemptRef, {
                status: 'rewarded',
                rewardedAt: Timestamp.now(),
            })

            const userRef = doc(db, 'users', userId)
            const userSnap = await transaction.get(userRef)
            if (!userSnap.exists()) {
                throw new Error('User not found')
            }

            transaction.update(userRef, {
                balance: increment(rewardAmount),
            })

            const ledgerEntry: Omit<TaskRewardLedgerEntry, 'id'> = {
                userId,
                taskId,
                taskAttemptId: attemptId,
                amount: rewardAmount,
                status: 'completed',
                idempotencyKey,
                createdAt: Timestamp.now(),
            }

            transaction.set(ledgerRef, ledgerEntry)

            return { success: true, error: undefined, rewarded: true }
        })

        return result
    } catch (error: any) {
        console.error('verifyAndReward failed:', error)
        return { success: false, error: error.message || 'Failed to verify and reward', rewarded: false }
    }
}

export async function rejectTaskAttempt(
    userId: string,
    taskId: string,
    reason: string,
): Promise<{ success: boolean; error?: string }> {
    const attemptId = generateAttemptId(userId, taskId)

    try {
        await runTransaction(db, async (transaction) => {
            const attemptRef = doc(db, 'task_attempts', attemptId)
            const attemptSnap = await transaction.get(attemptRef)

            if (!attemptSnap.exists()) {
                throw new Error('No task attempt found')
            }

            const data = attemptSnap.data() as TaskAttempt
            if (data.status === 'rewarded' || data.status === 'rejected') {
                throw new Error(`Cannot reject task with status ${data.status}`)
            }

            transaction.update(attemptRef, {
                status: 'rejected',
                rejectedAt: Timestamp.now(),
                rejectionReason: reason,
            })
        })

        return { success: true }
    } catch (error: any) {
        console.error('rejectTaskAttempt failed:', error)
        return { success: false, error: error.message || 'Failed to reject task' }
    }
}

export async function getTaskHistory(
    userId: string,
    limitCount: number = 50,
): Promise<TaskAttempt[]> {
    try {
        const q = query(
            collection(db, 'task_attempts'),
            where('userId', '==', userId),
            orderBy('startedAt', 'desc'),
            limit(limitCount),
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskAttempt))
    } catch (error) {
        console.error('getTaskHistory failed:', error)
        return []
    }
}
