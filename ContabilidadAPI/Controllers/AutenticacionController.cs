using ContabilidadAPI.Lib;
using ContabilidadAPI.Model;
using ContabilidadAPI.Service;
using Microsoft.AspNetCore.Mvc;

namespace ContabilidadAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AutenticacionController : ControllerBase
    {
        private readonly AuthHelper Auth;
        private readonly ContabilidadService Service;
        private readonly ILogger<CuentaContableController> Logger;

        public AutenticacionController(ContabilidadService service, ILogger<CuentaContableController> logger, AuthHelper auth)
        {
            Auth = auth;
            Logger = logger;
            Service = service;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UsuarioAuxiliar.UA_CrearDTO dto)
        {
            try
            {
                UsuarioAuxiliar usuario = new UsuarioAuxiliar()
                {
                    Nombre = dto.Nombre,
                    Email = dto.Email,
                    //aqui no esta encriptada, lo hara en el manager
                    ContrasenaHash = dto.Password,
                    Estado = true,
                };

                if (dto.SistemaAuxiliarId != 0)
                {
                    var sistemAux = await Service.SistemaAuxiliarManager
                        .Buscar(dto.SistemaAuxiliarId);
                    if (sistemAux != null)
                        usuario.SistemaAuxiliarId = sistemAux.ObjectId;
                }

                await Service.UsuarioAuxiliarManager.CrearAsync(usuario);
                string token = Auth.GenerateJWTToken(usuario);

                return Ok(new
                {
                    Token = token,
                    Usuario = new
                    {
                        usuario.Id,
                        usuario.Nombre,
                        usuario.Email,
                        dto.SistemaAuxiliarId
                    }
                });
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error en el registro: {ex.Message}");
                return BadRequest(new { mensaje = "Error en el registro." });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UsuarioAuxiliar.UA_LoginDTO dto)
        {
            try
            {
                var (Usuario, AccesoValido) = await Service.UsuarioAuxiliarManager
                    .VerificarCredenciales(dto.Email, dto.Password);
                if (Usuario is null)
                    return Unauthorized(new { mensaje = "Usuario no existe, favor registrarse." });
                if (!AccesoValido)
                    return Unauthorized(new { mensaje = "Credenciales incorrectas." });

                string token = Auth.GenerateJWTToken(Usuario);
                return Ok(new
                {
                    Token = token,
                    Usuario = new
                    {
                        Usuario.Id,
                        Usuario.Nombre,
                        Usuario.Email,
                        SistemaAuxiliarId = Usuario._SistemaId,
                    }
                });
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error en el login: {ex.Message}");
                return BadRequest(new { mensaje = "Error en el login." });
            }
        }
    }
}
