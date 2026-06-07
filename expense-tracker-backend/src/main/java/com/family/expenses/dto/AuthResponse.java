package com.family.expenses.dto;

public record AuthResponse(
        String token,
        String name,
        String email,
        String role,
        Long familyId
) {}
