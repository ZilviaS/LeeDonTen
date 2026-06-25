using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography.Xml;

namespace LeeDonTen.Api.Entities;

public class Withdraws
{
    [Required]
    public int Id {get; set;}
    [Required]
    public string UserId {get; set;} = string.Empty;
    public User User {get; set;} = null!;
    [Required]
    public string AccountName {get; set;} = string.Empty;
    [Required]
    public string AccountNumber {get; set;} = string.Empty;
    [Required]
    public PaymentOption PaymentOption {get; set;}
    [Required]
    public decimal Amount {get; set;}
    [Required]
    public WithdrawStatus Status {get;set;}
    public string? ReferenceNo {get;set;}
    public string? Remark {get; set;}
    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
    public DateTime ProcessAt {get; set;}
}

public enum PaymentOption{
    Krungsri, Krungthai, Kasikorn, SCB, PromptPay
}

public enum WithdrawStatus
{
    Pending, Success, Reject
}