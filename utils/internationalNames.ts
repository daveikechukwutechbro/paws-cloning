// International and multilingual names for realistic in-app messaging and leaderboards
export const INTERNATIONAL_NAMES = {
    // English
    english: ['Sophia', 'Liam', 'Emma', 'Noah', 'Olivia', 'Ethan', 'Ava', 'Mason', 'Isabella', 'Logan', 'Mia', 'Lucas', 'Charlotte', 'Oliver', 'Amelia'],
    // Spanish
    spanish: ['María', 'Juan', 'Carmen', 'José', 'Luis', 'Rosa', 'Miguel', 'Angeles', 'Francisco', 'Isabel', 'Diego', 'Ana', 'Javier', 'Mercedes', 'Pedro'],
    // French
    french: ['Sophie', 'Luc', 'Marie', 'Jean', 'Claire', 'Pierre', 'Anne', 'Michel', 'Isabelle', 'François', 'Monique', 'Henri', 'Véronique', 'Marcel', 'Dominique'],
    // German
    german: ['Anna', 'Hans', 'Maria', 'Klaus', 'Greta', 'Wolfgang', 'Ingrid', 'Helmut', 'Barbara', 'Friedrich', 'Ursula', 'Gerhard', 'Christa', 'Karl', 'Elke'],
    // Italian
    italian: ['Giulia', 'Marco', 'Rosa', 'Giovanni', 'Francesca', 'Giuseppe', 'Margherita', 'Antonio', 'Lucia', 'Vincenzo', 'Carmela', 'Salvatore', 'Angelica', 'Matteo', 'Alessandra'],
    // Chinese (Mandarin)
    chinese: ['李明', '王芳', '李伟', '刘婷', '张军', '朱丽', '陈浩', '赵娟', '杨东', '周敏', '黄超', '吴佳', '徐志', '胡娅', '郭鹏'],
    // Japanese
    japanese: ['田中', '佐藤', '鈴木', '高橋', '山田', '中村', '小林', '吉田', '渡辺', '伊藤', '佐々木', '加藤', '松本', '青木', '菊池'],
    // Korean
    korean: ['김민준', '이수진', '박준호', '최지연', '정현우', '오소영', '강민석', '임혜진', '윤태희', '배현미', '서준혁', '연지은', '조승호', '유미영', '한석민'],
    // Russian
    russian: ['Иван', 'Мария', 'Петр', 'Анна', 'Сергей', 'Елена', 'Алексей', 'Ольга', 'Дмитрий', 'Екатерина', 'Николай', 'Надежда', 'Владимир', 'Ирина', 'Андрей'],
    // Arabic
    arabic: ['أحمد', 'فاطمة', 'محمد', 'عائشة', 'علي', 'زينب', 'حسن', 'نور', 'عمر', 'ليلى', 'إبراهيم', 'سارة', 'خالد', 'هند', 'يوسف'],
    // Indian (Hindi)
    hindi: ['राज', 'प्रिया', 'अमित', 'दिव्या', 'विक्रम', 'आनंद', 'समीर', 'पूजा', 'संजय', 'नीता', 'राजीव', 'रीना', 'सुरेश', 'ममता', 'मोहन'],
    // Portuguese
    portuguese: ['João', 'Maria', 'José', 'Ana', 'Paulo', 'Carla', 'Carlos', 'Fernanda', 'Luis', 'Patricia', 'Miguel', 'Joana', 'Antonio', 'Rosa', 'Pedro'],
    // Turkish
    turkish: ['Mehmet', 'Ayşe', 'Ahmet', 'Fatma', 'Ali', 'Leyla', 'Kadir', 'Zeynep', 'Mustafa', 'Şule', 'İbrahim', 'Gülşah', 'Şevket', 'Hülya', 'Kemal'],
    // Thai
    thai: ['สมชาย', 'จิตรา', 'วิทยา', 'วัลยา', 'สมศักดิ์', 'ศรีษา', 'พัฒน์', 'อรุณี', 'บัญชา', 'ดารา', 'ประชัย', 'ลีลา', 'อนันต์', 'นิ้ง', 'สมศรี'],
    // Vietnamese
    vietnamese: ['Nguyễn', 'Trần', 'Phạm', 'Hoàng', 'Võ', 'Đặng', 'Bùi', 'Dương', 'Lý', 'Mạc', 'Chu', 'Tạ', 'Tô', 'Khương', 'Hứa'],
    // Polish
    polish: ['Jan', 'Maria', 'Piotr', 'Anna', 'Stanisław', 'Zofia', 'Andrzej', 'Krystyna', 'Zbigniew', 'Urszula', 'Henryk', 'Jolanta', 'Tadeusz', 'Grażyna', 'Mirosław'],
    // Dutch
    dutch: ['Jan', 'Maria', 'Pieter', 'Anna', 'Willem', 'Petronella', 'Dirk', 'Greet', 'Henk', 'Corrie', 'Bart', 'Anja', 'Frank', 'Marlies', 'Erik'],
    // Swedish
    swedish: ['Anders', 'Maria', 'Per', 'Anna', 'Lars', 'Ingrid', 'Nils', 'Solveig', 'Erik', 'Birgitta', 'Gustaf', 'Linnéa', 'Sture', 'Gunilla', 'Bertil'],
    // Greek
    greek: ['Γιάννης', 'Μαρία', 'Παναγιώτης', 'Αικατερίνη', 'Κωνσταντίνος', 'Ελένη', 'Δημήτρης', 'Πολύχρονη', 'Νικόλαος', 'Σοφία', 'Ανδρέας', 'Παναγιώτα', 'Χρήστος', 'Ευανθία', 'Αριστείδης'],
}

export function getRandomInternationalName(seed?: number): string {
    const countries = Object.values(INTERNATIONAL_NAMES)
    
    if (seed !== undefined) {
        // Deterministic random based on seed
        const countryIndex = seed % countries.length
        const country = countries[countryIndex]
        const nameIndex = Math.floor(seed / countries.length) % country.length
        return country[nameIndex]
    }
    
    // Random selection
    const randomCountry = countries[Math.floor(Math.random() * countries.length)]
    return randomCountry[Math.floor(Math.random() * randomCountry.length)]
}

export function getRandomInternationalNames(count: number): string[] {
    const names: string[] = []
    const usedIndices = new Set<number>()
    
    while (names.length < count) {
        let seed = Math.floor(Math.random() * 10000)
        // Ensure uniqueness
        while (usedIndices.has(seed)) {
            seed = Math.floor(Math.random() * 10000)
        }
        usedIndices.add(seed)
        names.push(getRandomInternationalName(seed))
    }
    
    return names
}

export function getRealisticUsername(seed: number): string {
    const name = getRandomInternationalName(seed)
    const suffixes = ['', '_pro', '_elite', '_core', '🔥', '💎', '⭐', '🚀']
    const suffix = suffixes[seed % suffixes.length]
    return `${name}${suffix}`
}
