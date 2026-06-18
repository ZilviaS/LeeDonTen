using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Identity;

namespace LeeDonTen.Api.Entities;

public class User : IdentityUser
{
    // [Required]
    // public int Id {get; set;}
    // [Required]
    // public string Username {get; set;} = string.Empty;
    // [Required]
    // public string PasswordHash {get; set;} = string.Empty;
    // public string PromptpayNumber {get; set;} = string.Empty;
    // public string Email {get; set;} = string.Empty;
    // public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
    [MaxLength(50)]
    public string DisplayName {get; set;} = string.Empty;
    public bool IsOpenDonations {get; set;} = false;
}