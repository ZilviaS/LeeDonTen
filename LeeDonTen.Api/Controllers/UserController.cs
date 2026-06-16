using LeeDonTen.Api.Data;
using LeeDonTen.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using LeeDonTen.Api.Entities;
using LeeDonTen.Api.Service;
using Microsoft.AspNetCore.Identity;

namespace LeeDonTen.Api.Controllers;

[ApiController]
[Route("api/[Controller]")]

public class UserController : ControllerBase
{
    private readonly AppDbContext context;
    private readonly JwtService jwtService;
    private readonly UserManager<User> userManager;

    public UserController(UserManager<User> userManager, AppDbContext context, JwtService jwtService)
    {
        this.userManager = userManager;
        this.context = context;
        this.jwtService = jwtService;
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
        return Ok(new
        {
            token = jwtService.GenerateToken(user)
        });
    }

    [HttpGet("check/{username}")]
    public IActionResult CheckUser(string username)
    {
        var user = context.Users.FirstOrDefault(u => u.UserName == username);

        if(user is null)
        {
            return NotFound(new
            {
                message = "User not found!"
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

}

