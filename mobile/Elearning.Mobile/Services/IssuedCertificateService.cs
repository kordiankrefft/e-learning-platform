
namespace Elearning.Mobile.Services;

public class IssuedCertificateService
{
    private readonly ApiClient _apiClient;

    public IssuedCertificateService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<byte[]> DownloadForCourseAsync(int courseId)
    {
        var http = await _apiClient.GetClientAsync();

        var res = await http.GetAsync($"/courses/{courseId}/certificate/download", HttpCompletionOption.ResponseHeadersRead);
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadAsByteArrayAsync();
    }
}
