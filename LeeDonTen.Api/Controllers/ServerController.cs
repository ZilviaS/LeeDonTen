using Microsoft.AspNetCore.Mvc;

namespace LeeDonTen.Api.Controllers;

[ApiController]
[Route("api/[controller]")]

public class ServerController : ControllerBase
{
    [HttpGet]
    public IActionResult GetServerResponse()
    {
        return Ok();
    }
}