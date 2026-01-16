import { exec } from 'child_process';
import ffprobeStatic from 'ffprobe-static';

const getVideoDuration = (filePath) => {
    return new Promise((resolve, reject) => {
        if (!filePath) {
            return reject(new Error("File path is required to get video duration."));
        }
        
        const command = `${ffprobeStatic.path} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing ffprobe for ${filePath}:`, error);
                console.error(`ffprobe stderr: ${stderr}`);
                return reject(new Error(`Could not get video duration: ${error.message}`));
            }
            if (stderr) { 
                console.warn(`ffprobe warnings for ${filePath}:`, stderr);
            }

            const durationString = stdout.trim();
            const duration = parseFloat(durationString);

            if (isNaN(duration)) {
                console.error(`Failed to parse duration from ffprobe output for ${filePath}: "${durationString}"`);
                return reject(new Error("Failed to extract valid video duration."));
            }

            resolve(Math.round(duration)); 
        });
    });
};

export { getVideoDuration };