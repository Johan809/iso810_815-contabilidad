using Serilog;
using ContabilidadAPI.Model;
using ContabilidadAPI.Service;
using System.ComponentModel;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

#region Logger
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/api.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();
builder.Logging.ClearProviders();
builder.Logging.AddSerilog();
#endregion

#region Services
builder.Services.AddSingleton<EntityContext>();
builder.Services.AddSingleton<ContabilidadService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.CustomSchemaIds(x => x.GetCustomAttribute<DisplayNameAttribute>(false)
        ?.DisplayName ?? x.Name);
});

// ✅ Enable CORS to allow frontend access
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:8080") // Allow frontend URL
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});
#endregion

var app = builder.Build();

// ✅ Use CORS before controllers
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();

