import dotenv from 'dotenv'
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner" 

dotenv.config()

// AWS Configurations
const REGION = process.env.AWS_REGION;
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const s3Client = new S3Client({ region: REGION });


exports.cloudFile = async function cloudFile(fileName) {
    console.log("Generating S3 Signed URL...");
    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
        };

        const expiresIn = 24 * 60 * 60;

        const command = new GetObjectCommand(params);
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        console.log("Generated Signed URL: ", signedUrl);

        return signedUrl;
    } catch (error) {
        console.error("Error generating S3 signed URL:", error);
        throw error;
    }
}


exports.generateUploadURL = async function generateUploadURL(fileName, expiresIn = 300) {
    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            ContentType: "application/octet-stream",
        };
        const command = new PutObjectCommand(params);
        const uploadURL = await getSignedUrl(s3Client, command, { expiresIn });
        return uploadURL;
    } catch (error) {
        console.error("Error generating S3 signed URL:", error);
        throw error;
    }
}


exports.deleteFile = async function deleteFile(fileName) {
    try {
        // Parameters to delete the object
        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
        };

        // Delete the file
        const command = new DeleteObjectCommand(params);
        const data = await s3Client.send(command);
        console.log("File deleted successfully:", data);
    } catch (error) {
        console.error("Error deleting file:", error);
        throw error;
    }
}

