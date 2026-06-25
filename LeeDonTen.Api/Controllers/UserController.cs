using LeeDonTen.Api.Data;
using LeeDonTen.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using LeeDonTen.Api.Entities;
using LeeDonTen.Api.Service;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace LeeDonTen.Api.Controllers;

[ApiController]
[Route("api/[Controller]")]

public class UserController : ControllerBase
{
    private readonly AppDbContext context;
    private readonly JwtService jwtService;
    private readonly UserManager<User> userManager;
    private readonly IUserBalanceService balanceService;

    public UserController(UserManager<User> userManager, AppDbContext context, JwtService jwtService, IUserBalanceService balanceService)
    {
        this.userManager = userManager;
        this.context = context;
        this.jwtService = jwtService;
        this.balanceService = balanceService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(UserRegisterDto dto)
    {
        if (dto.Password != dto.ConfirmPassword)
        {
            return BadRequest(new
            {
                message = "Password is not match"
            });
        }

        if (context.Users.Any(u=> u.UserName == dto.Username))
        {
            return BadRequest(new
            {
                message = "this Username is already used"
            });
        }

        if (context.Users.Any(u => u.Email == dto.Email))
        {
            return BadRequest(new
            {
                message = "this Email is already used"
            });
        }


        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email
        };

        var result = await userManager.CreateAsync(
            user, dto.Password
        );

        Console.WriteLine(result.Succeeded);
        Console.WriteLine(string.Join(", ", result.Errors.Select(e => e.Description)));

        if (!result.Succeeded)
        {
            Console.WriteLine("Error dB");
            return BadRequest(new{
                message = result.Errors
            });
        }

        Console.WriteLine("Register");
        return Ok(new
        {
            message = "The User is registered"
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(UserLoginDto dto)
    {
        var user = await userManager.FindByNameAsync(dto.Username);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "User not found"
            });
        }

        bool valid = await userManager.CheckPasswordAsync(
            user,
            dto.Password
        );
        
        if (!valid)
        {
            return Unauthorized(new
            {
                message = "Username or Password is not valid"
            });
        }

        Console.WriteLine("Login Successfully");
        var token = await jwtService.GenerateToken(user);
        return Ok(new
        {
            token
        });
    }

    [HttpGet("check/{username}")]
    public IActionResult CheckUserDonation(string username)
    {
        var user = context.Users.FirstOrDefault(u => u.UserName == username);

        if(user is null)
        {
            return NotFound(new
            {
                message = "User not found!"
            });
        }

        if(user.IsOpenDonations == false)
        {
            return Conflict(new
            {
                message = "Sorry, User is not open donation right now"
            });
        }

        return Ok(new
        {
            message = user.UserName
        });
    }

    [HttpGet("{username}/id")]
    public IActionResult GetId(string username)
    {
        var user = context.Users.FirstOrDefault(u => u.UserName == username);
        
        if (user is null)
        {
            return NotFound(new
            {
                message = "User not found!"
            });
        }

        return Ok(new
        {
            UserId = user.Id
        });
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpPut("donation/toggle")]
    public async Task<IActionResult> ToggleDonation()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Console.WriteLine("toggle donation status");

        if(userId == null)
        {
            return Unauthorized();
        }

        var data = await context.Users.FirstOrDefaultAsync(data=> data.Id == userId);
        if(data == null)
        {
            return BadRequest(new
            {
                message = "user not found"
            });
        }
        data.IsOpenDonations = !data.IsOpenDonations;
        await context.SaveChangesAsync();
        return Ok(new
        {
            isOpenDonation = data.IsOpenDonations
        });
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpGet("donation")]
    public async Task<IActionResult> GetDonationStatus()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        Console.WriteLine("get donation status");

        if(userId == null)
        {
            return Unauthorized();
        }

        var data = await context.Users.FirstOrDefaultAsync(data=> data.Id == userId);
        if(data == null)
        {
            return BadRequest(new
            {
                message = "user not found"
            });
        }
        return Ok(new
        {
            isOpenDonation = data.IsOpenDonations
        });
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpGet("balance")]
    public async Task<IActionResult> GetUserAmount()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
        {
            return Unauthorized();
        }
        var user = await context.Users.FirstOrDefaultAsync(data => data.Id == userId);

        if (user == null)
        {
            return BadRequest(new
            {
                messsage = "user now found"
            });
        }

        var balance = balanceService.GetBalance(user.Id);
        return Ok(new
        {
            total = balance
        });
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpGet("role")]
    public async Task<IActionResult> GetUserRole()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Console.WriteLine("You are here");
        if(userId == null)
        {
            return BadRequest(new
            {
                message = "user not found"
            });
        }

        var user = await userManager.FindByIdAsync(userId);

        if (user == null)
        {
            return NotFound();
        }

        var role = await userManager.GetRolesAsync(user);

        return Ok(new
        {
            role
        });
    }


}

