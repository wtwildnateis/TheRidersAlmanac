package com.ridersalmanac.riders_almanac.common.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {
    private final ImageStorageService storage;

    // Authenticated users can upload
    @PostMapping(path="/image", consumes = "multipart/form-data")
    public ResponseEntity<ImageUploadResponse> upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "riders-almanac/misc") String folder,
            @AuthenticationPrincipal UserDetails principal
    ) {
        String url = storage.uploadImage(file, folder);
        return ResponseEntity.ok(new ImageUploadResponse(url));
    }

    public record ImageUploadResponse(String url) {}
}