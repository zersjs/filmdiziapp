import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '..', 'src');
const ROOT_DIR = path.join(__dirname, '..');

const JS_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];
const CSS_EXTENSIONS = ['.css', '.scss', '.sass', '.less'];
const HTML_EXTENSIONS = ['.html', '.htm'];

const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];

function removeJSComments(content) {
    let result = '';
    let i = 0;
    let inString = false;
    let stringChar = '';
    let inTemplateString = false;
    let templateBraceDepth = 0;
    
    while (i < content.length) {
        if (inString) {
            if (content[i] === '\\' && i + 1 < content.length) {
                result += content[i] + content[i + 1];
                i += 2;
                continue;
            }
            if (content[i] === stringChar) {
                inString = false;
                result += content[i];
                i++;
                continue;
            }
            result += content[i];
            i++;
            continue;
        }
        
        if (inTemplateString) {
            if (content[i] === '\\' && i + 1 < content.length) {
                result += content[i] + content[i + 1];
                i += 2;
                continue;
            }
            if (content[i] === '$' && content[i + 1] === '{') {
                templateBraceDepth++;
                result += content[i] + content[i + 1];
                i += 2;
                continue;
            }
            if (content[i] === '}' && templateBraceDepth > 0) {
                templateBraceDepth--;
                result += content[i];
                i++;
                continue;
            }
            if (content[i] === '`' && templateBraceDepth === 0) {
                inTemplateString = false;
                result += content[i];
                i++;
                continue;
            }
            result += content[i];
            i++;
            continue;
        }
        
        if (content[i] === '"' || content[i] === "'") {
            inString = true;
            stringChar = content[i];
            result += content[i];
            i++;
            continue;
        }
        
        if (content[i] === '`') {
            inTemplateString = true;
            templateBraceDepth = 0;
            result += content[i];
            i++;
            continue;
        }
        
        if (content[i] === '/' && content[i + 1] === '/') {
            while (i < content.length && content[i] !== '\n') {
                i++;
            }
            continue;
        }
        
        if (content[i] === '/' && content[i + 1] === '*') {
            i += 2;
            while (i < content.length && !(content[i] === '*' && content[i + 1] === '/')) {
                i++;
            }
            i += 2;
            continue;
        }
        
        result += content[i];
        i++;
    }
    
    return result;
}

function removeCSSComments(content) {
    let result = '';
    let i = 0;
    let inString = false;
    let stringChar = '';
    
    while (i < content.length) {
        if (inString) {
            if (content[i] === '\\' && i + 1 < content.length) {
                result += content[i] + content[i + 1];
                i += 2;
                continue;
            }
            if (content[i] === stringChar) {
                inString = false;
            }
            result += content[i];
            i++;
            continue;
        }
        
        if (content[i] === '"' || content[i] === "'") {
            inString = true;
            stringChar = content[i];
            result += content[i];
            i++;
            continue;
        }
        
        if (content[i] === '/' && content[i + 1] === '*') {
            i += 2;
            while (i < content.length && !(content[i] === '*' && content[i + 1] === '/')) {
                i++;
            }
            i += 2;
            continue;
        }
        
        result += content[i];
        i++;
    }
    
    return result;
}

function removeHTMLComments(content) {
    let result = '';
    let i = 0;
    
    while (i < content.length) {
        if (content.substring(i, i + 4) === '<!--') {
            let endIndex = content.indexOf('-->', i + 4);
            if (endIndex !== -1) {
                i = endIndex + 3;
                continue;
            }
        }
        result += content[i];
        i++;
    }
    
    return result;
}

function cleanEmptyLines(content) {
    const lines = content.split('\n');
    const result = [];
    let prevWasEmpty = false;
    
    for (const line of lines) {
        const trimmed = line.trim();
        const isEmpty = trimmed === '';
        
        if (isEmpty && prevWasEmpty) {
            continue;
        }
        
        result.push(line);
        prevWasEmpty = isEmpty;
    }
    
    while (result.length > 0 && result[result.length - 1].trim() === '') {
        result.pop();
    }
    
    if (result.length > 0) {
        result.push('');
    }
    
    return result.join('\n');
}

function removeEmptyJSXBraces(content) {
    const lines = content.split('\n');
    const result = [];
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '{}') {
            continue;
        }
        result.push(line);
    }
    
    return result.join('\n');
}

function processFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    
    if (JS_EXTENSIONS.includes(ext)) {
        newContent = removeJSComments(content);
        newContent = removeEmptyJSXBraces(newContent);
    } else if (CSS_EXTENSIONS.includes(ext)) {
        newContent = removeCSSComments(content);
    } else if (HTML_EXTENSIONS.includes(ext)) {
        newContent = removeHTMLComments(content);
    } else {
        return false;
    }
    
    newContent = cleanEmptyLines(newContent);
    
    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        return true;
    }
    
    return false;
}

function walkDirectory(dir, callback) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                walkDirectory(filePath, callback);
            }
        } else {
            callback(filePath);
        }
    }
}

function main() {
    const dirsToProcess = [SRC_DIR];
    
    const rootFiles = [
        'postcss.config.js',
        'tailwind.config.js',
        'vite.config.js',
        'vitest.config.js',
        'index.html'
    ];
    
    let processedCount = 0;
    let modifiedCount = 0;
    
    console.log('Yorum satirlarini temizleme islemi basliyor...\n');
    
    for (const dir of dirsToProcess) {
        if (fs.existsSync(dir)) {
            walkDirectory(dir, (filePath) => {
                const ext = path.extname(filePath).toLowerCase();
                if ([...JS_EXTENSIONS, ...CSS_EXTENSIONS, ...HTML_EXTENSIONS].includes(ext)) {
                    processedCount++;
                    const modified = processFile(filePath);
                    if (modified) {
                        modifiedCount++;
                        console.log(`[TEMIZLENDI] ${path.relative(ROOT_DIR, filePath)}`);
                    }
                }
            });
        }
    }
    
    for (const file of rootFiles) {
        const filePath = path.join(ROOT_DIR, file);
        if (fs.existsSync(filePath)) {
            processedCount++;
            const modified = processFile(filePath);
            if (modified) {
                modifiedCount++;
                console.log(`[TEMIZLENDI] ${file}`);
            }
        }
    }
    
    console.log(`\n--- SONUC ---`);
    console.log(`Taranan dosya: ${processedCount}`);
    console.log(`Degistirilen dosya: ${modifiedCount}`);
    console.log('Islem tamamlandi!');
}

main();
