using ContabilidadAPI.Lib;
using ContabilidadAPI.Model;
using ContabilidadAPI.Service;
using Microsoft.AspNetCore.Mvc;

namespace ContabilidadAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CuentaContableController : ControllerBase
    {
        private readonly ContabilidadService Service;
        private readonly ILogger<TipoCuentaController> Logger;

        public CuentaContableController(ContabilidadService service, ILogger<TipoCuentaController> logger)
        {
            Service = service;
            Logger = logger;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var cuentaContable = await Service.CuentaContableManager.Buscar(id);
            if (cuentaContable is null)
                return NotFound($"Cuenta Contable con Id: {id} no encontrado");

            return Ok(cuentaContable);
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodos([FromQuery] CuentaContable.Where where)
        {
            where = where ?? new CuentaContable.Where();
            var lista = await Service.CuentaContableManager.Buscar(where);
            return Ok(lista);
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] CuentaContable.CC_CrearDTO dto)
        {
            try
            {
                CuentaContable cuentaContable = new(dto);
                await AsignarReferencias(dto, cuentaContable);
                await Service.CuentaContableManager.CrearAsync(cuentaContable);
                return CreatedAtAction(nameof(ObtenerPorId), new { id = cuentaContable.Id }, cuentaContable);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error al crear CuentaContable");
                return StatusCode(500, Constantes.ERROR_SERVIDOR);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] CuentaContable.CC_EditarDTO dto)
        {
            try
            {
                CuentaContable? cuentaContable = await Service.CuentaContableManager.Buscar(id);
                if (cuentaContable is null)
                    return NotFound($"Cuenta Contable con Id: {id} no encontrado");

                await AsignarReferencias(dto, cuentaContable);
                cuentaContable.Descripcion = dto.Descripcion;
                cuentaContable.PermiteTransacciones = dto.PermiteTransacciones;
                cuentaContable.Nivel = dto.Nivel;
                cuentaContable.Balance = dto.Balance;
                cuentaContable.Estado = dto.Estado;

                bool actualizado = await Service.CuentaContableManager
                    .ActualizarAsync(cuentaContable);
                if (!actualizado)
                    return BadRequest($"Cuenta Contable con Id: {id} no pudo ser actualizado.");

                return Ok(actualizado);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error al actualizar CuentaContable");
                return StatusCode(500, Constantes.ERROR_SERVIDOR);
            }
        }

        private async Task AsignarReferencias(CuentaContable.BaseDTO dto, CuentaContable cuentaContable)
        {
            //hay que buscar el TipoCuenta y la CuentaPadre, si hay
            if (dto.TipoCuentaId != 0)
            {
                var tipoCuenta = await Service.TipoCuentaManager
                    .Buscar(dto.TipoCuentaId);
                if (tipoCuenta is not null)
                    cuentaContable.TipoCuentaId = tipoCuenta.ObjectId!;
            }
            if (dto.CuentaMayorId.HasValue && dto.CuentaMayorId.Value != 0)
            {
                var cuentaMayor = await Service.CuentaContableManager
                    .Buscar(dto.CuentaMayorId.Value);
                if (cuentaMayor is not null)
                    cuentaContable.CuentaMayorId = cuentaMayor.ObjectId!;
            }
        }
    }
}
