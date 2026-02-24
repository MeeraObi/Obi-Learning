const fs = require('fs');
const path = require('path');

const icseDir = path.join(__dirname, '..', 'syllabus', 'ICSE');

function generateID(subject, classNum, chapterIndex) {
    const prefixes = {
        'Mathematics': 'MATH',
        'Science': 'SCI',
        'English': 'ENG',
        'Hindi': 'HIN',
        'Social Science': 'SOC',
        'Environmental Studies': 'EVS',
        'Computer Applications': 'COMP',
        'Geography': 'GEO',
        'History': 'HIS',
        'Physics': 'PHY',
        'Chemistry': 'CHEM',
        'Biology': 'BIO'
    };
    const prefix = prefixes[subject] || subject.substring(0, 3).toUpperCase();
    const classStr = classNum.toString().padStart(2, '0');
    const chapterStr = (chapterIndex + 1).toString().padStart(2, '0');
    return `${prefix}_${classStr}_${chapterStr}`;
}

async function restructure() {
    const files = fs.readdirSync(icseDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(icseDir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (!content.ICSE) continue;

        for (const className in content.ICSE) {
            // Extract numeric class for IDs
            const classMatch = className.match(/\d+/);
            const classNum = classMatch ? classMatch[0] : "00";

            for (const subject in content.ICSE[className]) {
                const originalChapters = content.ICSE[className][subject];
                const newChapters = [];
                let chapterCounter = 0;

                for (const oldChapter of originalChapters) {
                    for (const oldTopic of oldChapter.topics) {
                        // Strip "Core concepts of " if we are re-running on already processed data
                        const cleanTopicName = oldTopic.topic_name.startsWith("Core concepts of ")
                            ? oldTopic.topic_name.replace("Core concepts of ", "")
                            : oldTopic.topic_name;

                        // Split comma- and semicolon-separated items in topic_name, but respect parentheses
                        const subTopics = [];
                        let current = "";
                        let parenDepth = 0;
                        for (let char of cleanTopicName) {
                            if (char === '(') parenDepth++;
                            if (char === ')') parenDepth--;
                            if ((char === ',' || char === ';') && parenDepth === 0) {
                                subTopics.push(current.trim());
                                current = "";
                            } else {
                                current += char;
                            }
                        }
                        subTopics.push(current.trim());

                        const filteredSubTopics = subTopics.filter(s => s);

                        for (const subTopic of filteredSubTopics) {
                            const chapterId = generateID(subject, classNum, chapterCounter);
                            const topicId = `${chapterId}_01`;

                            newChapters.push({
                                chapter_id: chapterId,
                                chapter_no: chapterCounter + 1,
                                chapter_name: subTopic,
                                domain: oldChapter.domain || subject,
                                topics: [
                                    {
                                        topic_id: topicId,
                                        topic_name: `Core concepts of ${subTopic}`,
                                        difficulty: oldTopic.difficulty || 'medium',
                                        estimated_minutes: oldTopic.estimated_minutes || 45,
                                        recommended_methods: oldTopic.recommended_methods || ["visual", "discussion"],
                                        assessment: oldTopic.assessment || { quiz: true },
                                        prerequisites: oldTopic.prerequisites || []
                                    }
                                ]
                            });
                            chapterCounter++;
                        }
                    }
                }
                content.ICSE[className][subject] = newChapters;
            }
        }

        fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
        console.log(`Updated ${file}`);
    }
}

restructure().catch(console.error);
