using ContabilidadAPI.Service;
using Microsoft.AspNetCore.Mvc;

namespace ContabilidadAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly ContabilidadService Service;
        private readonly ILogger<DashboardController> Logger;

        public DashboardController(ContabilidadService service, ILogger<DashboardController> logger)
        {
            Logger = logger;
            Service = service;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerConteo()
        {
            var resumen = await Service.CuentaContableManager.ObtenerResumenSistemaAsync();
            return Ok(resumen);
        }
    }
}
