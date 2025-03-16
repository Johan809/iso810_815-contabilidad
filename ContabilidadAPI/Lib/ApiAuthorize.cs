using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ContabilidadAPI.Lib
{
    public class ApiAuthorize : Attribute, IAuthorizationFilter
    {
        private readonly IConfiguration _configuration;

        public ApiAuthorize()
        {
            _configuration = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var request = context.HttpContext.Request;
            var authHeader = request.Headers["Authorization"].FirstOrDefault();

            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                context.Result = new JsonResult(new { message = "Token no proporcionado" }) { StatusCode = StatusCodes.Status401Unauthorized };
                return;
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_configuration["JWT_Secret"]!);
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero, // No permitir tolerancia en la expiración
                    ValidateLifetime = true
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                var jwtToken = (JwtSecurityToken)validatedToken;

                // Obtener claims
                var usuarioId = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
                var nombre = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                var sistemaId = jwtToken.Claims.FirstOrDefault(c => c.Type == "SistemaAuxiliarId")?.Value;

                if (string.IsNullOrEmpty(usuarioId) || string.IsNullOrEmpty(nombre) || string.IsNullOrEmpty(sistemaId))
                {
                    context.Result = new JsonResult(new { message = "Token inválido o malformado" }) { StatusCode = StatusCodes.Status401Unauthorized };
                    return;
                }

                // Guardar datos en el contexto para uso en el controlador
                context.HttpContext.Items["UsuarioId"] = usuarioId;
                context.HttpContext.Items["Nombre"] = nombre;
                context.HttpContext.Items["SistemaAuxiliarId"] = sistemaId;
            }
            catch (SecurityTokenExpiredException)
            {
                context.Result = new JsonResult(new { message = "Token expirado, por favor inicie sesión nuevamente" }) { StatusCode = StatusCodes.Status401Unauthorized };
            }
            catch (Exception)
            {
                context.Result = new JsonResult(new { message = "Token inválido" }) { StatusCode = StatusCodes.Status401Unauthorized };
            }
        }
    }
}
