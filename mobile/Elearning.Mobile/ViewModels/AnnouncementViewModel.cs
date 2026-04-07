using Elearning.Mobile.Dtos.Announcement;
using Elearning.Mobile.Utils;

namespace Elearning.Mobile.ViewModels;

public class AnnouncementViewModel
{
    public int Id { get; }
    public string Title { get; }
    public string? CreatedAt { get; }

    public AnnouncementParsedBody Parsed { get; }

    public bool IsPricePromo => Parsed.Kind == "pricePromo";
    public bool IsDurationPromo => Parsed.Kind == "durationPromo";
    public bool IsPlain => Parsed.Kind == "plain";

    public string PlainText => Parsed.PlainText;

    // price promo
    public string? PriceDescription => Parsed.PricePromo?.Description;
    public string? OldPriceText => Parsed.PricePromo is null ? null : $"{Parsed.PricePromo.OldPrice:0.##} {Parsed.PricePromo.Currency}";
    public string? NewPriceText => Parsed.PricePromo is null ? null : $"{Parsed.PricePromo.NewPrice:0.##} {Parsed.PricePromo.Currency}";

    // duration promo
    public string? DurationDescription => Parsed.DurationPromo?.Description;
    public string? OldDaysText => Parsed.DurationPromo is null ? null : $"{Parsed.DurationPromo.OldDays} dni";
    public string? NewDaysText => Parsed.DurationPromo is null ? null : $"{Parsed.DurationPromo.NewDays} dni";

    public AnnouncementViewModel(AnnouncementDto dto)
    {
        Id = dto.Id;
        Title = dto.Title;
        CreatedAt = dto.CreatedAt;
        Parsed = AnnouncementBodyParser.Parse(dto.Body);
    }
}
