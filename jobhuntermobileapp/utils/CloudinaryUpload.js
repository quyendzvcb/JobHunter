export const uploadToCloudinary = async (fileUri, fileName, fileType) => {
    if (!fileUri) return null;

    const data = new FormData();
    data.append('file', {
        uri: fileUri,
        name: fileName || 'upload.jpg', // Fallback tên file
        type: fileType || 'image/jpeg', // Fallback loại file
    });
    data.append('upload_preset', 'jobhunter_unsigned');
    data.append("cloud_name", "dqbheiddg");

    try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dqbheiddg/auto/upload", {
            method: "post",
            body: data,
            // [QUAN TRỌNG] Đã XÓA phần headers Content-Type
            // React Native sẽ tự động thêm header này kèm boundary
        });

        const result = await res.json();

        if (result.secure_url) {
            return result.secure_url;
        } else {
            console.log("Cloudinary trả về lỗi:", result);
            return null;
        }
    } catch (error) {
        console.log("Upload failed:", error);
        return null;
    }
};