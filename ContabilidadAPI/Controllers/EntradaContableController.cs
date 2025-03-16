using ContabilidadAPI.Lib;
using ContabilidadAPI.Model;
using ContabilidadAPI.Service;
using Microsoft.AspNetCore.Mvc;

namespace ContabilidadAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EntradaContableController : ControllerBase
    {
        private readonly ContabilidadService Service;
        private readonly ILogger<EntradaContableController> Logger;

        public EntradaContableController(ContabilidadService service, ILogger<EntradaContableController> logger)
        {
            Logger = logger;
            Service = service;
        }

        [ApiAuthorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var entradaContable = await Service.EntradaContableManager.Buscar(id);
            if (entradaContable is null)
                return NotFound($"Entrada Contable con Id: {id} no encontrada");

            return Ok(entradaContable);
        }

        [HttpGet]
        [ApiAuthorize]
        public async Task<IActionResult> ObtenerTodos([FromQuery] EntradaContable.Where where)
        {
            where = where ?? new EntradaContable.Where();
            var lista = await Service.EntradaContableManager.Buscar(where);
            return Ok(lista);
        }

        [HttpPost]
        [ApiAuthorize]
        public async Task<IActionResult> Crear([FromBody] EntradaContable.EC_Crear_DTO dto)
        {
            try
            {
                if (dto.Detalles is null || dto.Detalles.Count < 2)
                    return BadRequest("Debe haber al menos dos detalles en la entrada contable.");

                //hay que llenar el SistemaAuxiliarId manual
                //procesar los detalles;
                EntradaContable entradaContable = new(dto);
                if (dto.SistemaAuxiliarId != 0)
                {
                    var auxiliar = await Service.SistemaAuxiliarManager
                        .Buscar(dto.SistemaAuxiliarId);
                    if (auxiliar is not null)
                        entradaContable.SistemaAuxiliarId = auxiliar.ObjectId!;
                }

                var cuentasAfectadas = await Service.CuentaContableManager
                    .Buscar(new CuentaContable.Where()
                    {
                        Estado = true,
                        IdList = dto.Detalles.Select(d => d.CuentaId).ToList(),
                    });
                foreach (var d in dto.Detalles)
                {
                    EntradaContableDetalle detalle = new()
                    {
                        MontoAsiento = d.MontoAsiento,
                        TipoMovimiento = d.TipoMovimiento ?? string.Empty,
                        CuentaId = cuentasAfectadas
                            .FirstOrDefault(c => c.Id == d.CuentaId)
                                ?.ObjectId ?? string.Empty,
                    };
                    entradaContable.Detalles.Add(detalle);
                }

                await Service.EntradaContableManager.CrearAsync(entradaContable);
                var idArg = new { id = entradaContable.Id };
                return CreatedAtAction(nameof(ObtenerPorId), idArg, entradaContable);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error al crear EntradaContable");
                return StatusCode(500, Constantes.ERROR_SERVIDOR);
            }
        }

        [ApiAuthorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] EntradaContable.EC_Editar_DTO dto)
        {
            try
            {
                EntradaContable? entradaContable = await Service.EntradaContableManager.Buscar(id);
                if (entradaContable is null)
                    return NotFound($"Entrada Contable con Id: {id} no encontrada");
                if (dto.Detalles is null || dto.Detalles.Count < 2)
                    return BadRequest("Debe haber al menos dos detalles en la entrada contable.");

                entradaContable.Descripcion = dto.Descripcion;
                entradaContable.FechaAsiento = dto.FechaAsiento;
                entradaContable.Estado = dto.Estado ?? entradaContable.Estado;
                if (dto.SistemaAuxiliarId != 0)
                {
                    var auxiliar = await Service.SistemaAuxiliarManager
                        .Buscar(dto.SistemaAuxiliarId);
                    if (auxiliar is not null)
                        entradaContable.SistemaAuxiliarId = auxiliar.ObjectId!;
                }

                var cuentasAfectadas = await Service.CuentaContableManager
                    .Buscar(new CuentaContable.Where()
                    {
                        Estado = true,
                        IdList = dto.Detalles.Select(d => d.CuentaId).ToList(),
                    });
                List<EntradaContableDetalle> nuevosDetalle = [];
                foreach (var d in dto.Detalles)
                {
                    EntradaContableDetalle detalle = new()
                    {
                        MontoAsiento = d.MontoAsiento,
                        TipoMovimiento = d.TipoMovimiento ?? string.Empty,
                        CuentaId = cuentasAfectadas
                            .FirstOrDefault(c => c.Id == d.CuentaId)
                                ?.ObjectId ?? string.Empty,
                    };
                    nuevosDetalle.Add(detalle);
                }
                entradaContable.Detalles = nuevosDetalle;

                bool actualizado = await Service.EntradaContableManager
                    .ActualizarAsync(entradaContable);
                if (!actualizado)
                    return BadRequest($"Entrada Contable con Id: {id} no pudo ser actualizada.");

                return Ok(entradaContable);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error al actualizar EntradaContable");
                return StatusCode(500, Constantes.ERROR_SERVIDOR);
            }
        }
    }
}
