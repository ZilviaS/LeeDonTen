namespace LeeDonTen.Api.Dtos;
public record class WithdrawRequestDto
(
    string FName,
    string LName,
    string PaymentOption,
    string AccountNumber,
    decimal Amount
);

public record class DeniedRequestDTO(
    string Remark
);