namespace LeeDonTen.Api.Dtos;

public record class PaymentDto(
    string PaymentReference,
    int Status
);