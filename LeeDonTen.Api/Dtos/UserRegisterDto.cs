namespace LeeDonTen.Api.Dtos;

public record class UserRegisterDto
(
    string Username,
    string Password,
    string ConfirmPassword,
    string Email,
    bool Agree
);