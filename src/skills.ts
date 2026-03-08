import fs from 'fs';
import path from 'path';

const SUPERPOWERS_DIR = "C:\\gravityclaw\\superpowers-main\\superpowers-main\\skills";

export interface Skill {
    name: string;
    description: string;
    path: string;
}

export function listSkills(): Skill[] {
    const skills: Skill[] = [];
    if (!fs.existsSync(SUPERPOWERS_DIR)) return [];

    const dirs = fs.readdirSync(SUPERPOWERS_DIR, { withFileTypes: true });
    for (const dir of dirs) {
        if (dir.isDirectory()) {
            const skillFilePath = path.join(SUPERPOWERS_DIR, dir.name, 'SKILL.md');
            if (fs.existsSync(skillFilePath)) {
                const content = fs.readFileSync(skillFilePath, 'utf8');
                const nameMatch = content.match(/name:\s*(.*)/);
                const descMatch = content.match(/description:\s*(.*)/);

                skills.push({
                    name: nameMatch ? nameMatch[1].trim() : dir.name,
                    description: descMatch ? descMatch[1].trim() : '',
                    path: dir.name
                });
            }
        }
    }
    return skills;
}

export function getSkillInstructions(skillPath: string): string | null {
    const fullPath = path.join(SUPERPOWERS_DIR, skillPath, 'SKILL.md');
    if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, 'utf8');
    }
    return null;
}
