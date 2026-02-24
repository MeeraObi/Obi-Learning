const fs = require('fs');
const path = require('path');

const icseDir = path.join(__dirname, '..', 'Syllabus', 'ICSE');

function count(str, char) {
    let c = 0;
    for (let f of str) if (f === char) c++;
    return c;
}

async function heal() {
    const files = fs.readdirSync(icseDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(icseDir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (!content.ICSE) continue;

        for (const className in content.ICSE) {
            for (const subject in content.ICSE[className]) {
                const chapters = content.ICSE[className][subject];
                const healedChapters = [];

                for (let i = 0; i < chapters.length; i++) {
                    let chapter = chapters[i];
                    let openParens = count(chapter.chapter_name, '(');
                    let closeParens = count(chapter.chapter_name, ')');

                    if (openParens > closeParens) {
                        // We found a split!
                        let mergedName = chapter.chapter_name;
                        let lastChapter = chapter;
                        while (openParens > closeParens && i + 1 < chapters.length) {
                            i++;
                            let nextChapter = chapters[i];
                            mergedName += ", " + nextChapter.chapter_name;
                            openParens += count(nextChapter.chapter_name, '(');
                            closeParens += count(nextChapter.chapter_name, ')');
                            lastChapter = nextChapter;
                        }

                        // Create healed chapter
                        const prefix = chapter.chapter_id.split('_').slice(0, 2).join('_');
                        const index = healedChapters.length + 1;
                        const newId = `${prefix}_${index.toString().padStart(2, '0')}`;

                        healedChapters.push({
                            ...chapter,
                            chapter_id: newId,
                            chapter_no: index,
                            chapter_name: mergedName,
                            topics: [{
                                ...chapter.topics[0],
                                topic_id: `${newId}_01`,
                                topic_name: `Core concepts of ${mergedName}`
                            }]
                        });
                    } else {
                        // No split, just re-index
                        const prefix = chapter.chapter_id.split('_').slice(0, 2).join('_');
                        const index = healedChapters.length + 1;
                        const newId = `${prefix}_${index.toString().padStart(2, '0')}`;

                        healedChapters.push({
                            ...chapter,
                            chapter_id: newId,
                            chapter_no: index,
                            topics: [{
                                ...chapter.topics[0],
                                topic_id: `${newId}_01`
                            }]
                        });
                    }
                }
                content.ICSE[className][subject] = healedChapters;
            }
        }

        fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
        console.log(`Healed ${file}`);
    }
}

heal().catch(console.error);
