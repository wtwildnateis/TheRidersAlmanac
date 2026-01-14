package com.ridersalmanac.riders_almanac.users;

import com.ridersalmanac.riders_almanac.users.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import com.ridersalmanac.riders_almanac.auth.dto.AuthResponse;


@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class UserAccountController {

    private final UserAccountService accountService;

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal User principal) {
        return accountService.me(principal.getUsername());
    }

    @PatchMapping("/profile")
    public MeResponse updateProfile(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody UserUpdateRequest req) {
        return accountService.updateProfile(principal.getUsername(), req);
    }

    @PostMapping("/username")
    public AuthResponse changeUsername(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody ChangeUsernameRequest req) {
        return accountService.changeUsername(principal.getUsername(), req);
    }

    @PostMapping("/email")
    public MeResponse changeEmail(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody ChangeEmailRequest req) {
        return accountService.changeEmail(principal.getUsername(), req);
    }

    @PostMapping("/password")
    public void changePassword(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody ChangePasswordRequest req) {
        accountService.changePassword(principal.getUsername(), req);
    }
}