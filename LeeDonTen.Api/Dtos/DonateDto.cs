namespace LeeDonTen.Api.Dtos;
public record class DonateDto
(
    string UserId,
    string DonorName,
    string SongName,
    string Message,
    decimal Amount
);