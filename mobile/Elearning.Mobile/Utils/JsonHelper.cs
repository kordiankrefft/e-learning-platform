using System.Text.Json;

namespace Elearning.Mobile.Utils;

public static class JsonHelper
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static T? ParseJson<T>(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return default;

        try
        {
            return JsonSerializer.Deserialize<T>(value, Options);
        }
        catch
        {
            return default;
        }
    }
}
