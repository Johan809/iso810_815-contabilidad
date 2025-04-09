using ContabilidadAPI.Model;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ContabilidadAPI.Lib
{
    public class AuthHelper
    {
        private readonly IConfiguration _configuration;

        public AuthHelper(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateJWTToken(UsuarioAuxiliar user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Nombre),
                new Claim(ClaimTypes.NameIdentifier, user.ObjectId!),
                new Claim("SistemaAuxiliarId", user.SistemaAuxiliarId!)
            };

            SymmetricSecurityKey key = new(
                Encoding.UTF8.GetBytes(_configuration["JWT_Secret"]!)
            );
            SigningCredentials credentials = new(key, SecurityAlgorithms.HmacSha256Signature);

            JwtSecurityToken jwtToken = new(
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddDays(30),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(jwtToken);
        }
    }
}
