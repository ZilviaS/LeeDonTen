using System.ComponentModel.DataAnnotations;

namespace LeeDonTen.Api.Entities;

public class Request
{
    [Required]
    public int Id {get; set;}
    [Required]
    public string UserId {get; set;} = string.Empty;
    [Required]
    public string DonorName {get;set;} = string.Empty;
    [Required]
    [MaxLength(20)]
    public string SongName {get; set;} = string.Empty;
    [MaxLength(30)]
    public string Message {get; set;} = string.Empty;
    [Required]
    public decimal Amount {get; set;}
    [Required]
    public Status Status {get; set;}
    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;

    public ICollection<Payment> Payments { get; set; }
        = new List<Payment>();
    

}
public enum Status{
    PendingPayment = 0,
    Paid = 1,
    Unpaid = 2,

    Completed = 3,
    Cancelled = 4,
}