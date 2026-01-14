package com.ridersalmanac.riders_almanac.common.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImageStorageService {
    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file, String folder) {
        try {
            Map<?,?> res = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image",
                            "overwrite", false,
                            "unique_filename", true,
                            "transformation", new Transformation()
                                    .quality("auto")
                                    .fetchFormat("auto")

                    )
            );
            return (String) res.get("secure_url");
        } catch (Exception e) {
            throw new RuntimeException("Upload failed", e);
        }
    }
}