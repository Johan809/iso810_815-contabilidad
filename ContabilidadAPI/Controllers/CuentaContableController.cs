using ContabilidadAPI.Lib;
using ContabilidadAPI.Model;
using ContabilidadAPI.Service;
using Microsoft.AspNetCore.Mvc;
using CuentaContableModel = ContabilidadAPI.Model.CuentaContable.CC_ListarDTO;

namespace ContabilidadAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CuentaContableController : ControllerBase
    {
        private readonly ContabilidadService Service;
        private readonly ILogger<CuentaContableController> Logger;

        public CuentaContableController(ContabilidadService service, ILogger<CuentaContableController> logger)
        {
            Service = service;
            Logger = logger;
        }

        [ApiAuthorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var cuentaContable = await Service.CuentaContableManager.Buscar(id);
            if (cuentaContable is null)
                return NotFound($"Cuenta Contable con Id: {id} no encontrada");

            return Ok(await SimplificarModel(cuentaContable));
        }

        [HttpGet]
        [ApiAuthorize]
        public async Task<IActionResult> ObtenerTodos([FromQuery] CuentaContable.Where where)
        {
            where = where ?? new CuentaContable.Where();
            var lista = await Service.CuentaContableManager.Buscar(where);
            var listaSimplificada = await Task.WhenAll(lista
                .Select(async cuenta => await SimplificarModel(cuenta))
            );

            return Ok(listaSimplificada);
        }

        [HttpPost]
        [ApiAuthorize]
        public async Task<IActionResult> Crear([FromBody] CuentaContable.CC_CrearDTO dto)
        {
            try
            {
                CuentaContable cuentaContable = new(dto);
                await AsignarReferencias(dto, cuentaContable);
                await Service.CuentaContableManager.CrearAsync(cuentaContable);
                var model = await SimplificarModel(cuentaContable);
                return CreatedAtAction(nameof(ObtenerPorId), new { id = cuentaContable.Id }, model);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error al crear CuentaContable");
                return StatusCode(500, Constantes.ERROR_SERVIDOR);
            }
        }

        [ApiAuthorize]
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
                    return BadRequest($"Cuenta Contable con Id: {id} no pudo ser actualizada.");

                return Ok(await SimplificarModel(cuentaContable));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
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
            else
            {
                cuentaContable.CuentaMayorId = null;
            }
        }

        private async Task<CuentaContableModel> SimplificarModel(CuentaContable cuenta)
        {
            TipoCuenta? tipoCuenta = await Service.TipoCuentaManager.Buscar(cuenta.TipoCuentaId);
            CuentaContable? cuentaMayor = null;
            if (!string.IsNullOrEmpty(cuenta.CuentaMayorId))
                cuentaMayor = await Service.CuentaContableManager.Buscar(cuenta.CuentaMayorId);

            CuentaContableModel model = new CuentaContableModel()
            {
                Id = cuenta.Id,
                CuentaMayorId = cuentaMayor?.Id,
                Balance = cuenta.Balance,
                Descripcion = cuenta.Descripcion,
                Nivel = cuenta.Nivel,
                PermiteTransacciones = cuenta.PermiteTransacciones,
                TipoCuentaId = tipoCuenta?.Id ?? 1,
                Estado = cuenta.Estado
            };

            return model;
        }
    }
}
