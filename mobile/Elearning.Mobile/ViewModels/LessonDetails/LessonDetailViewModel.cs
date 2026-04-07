using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Elearning.Mobile.Dtos.Lesson;
using Elearning.Mobile.Dtos.LessonAttachment;
using Elearning.Mobile.Dtos.LessonContentBlock;
using Elearning.Mobile.Dtos.LessonProgress;
using Elearning.Mobile.Services;
using Elearning.Mobile.Services.Auth;
using Elearning.Mobile.ViewModels.LessonBlocks;
using Elearning.Mobile.Models;
namespace Elearning.Mobile.ViewModels.LessonDetails;

public class LessonDetailViewModel : INotifyPropertyChanged, IQueryAttributable
{
    private readonly LessonService _lessonService;
    private readonly LessonContentBlockService _blocksService;
    private readonly LessonAttachmentService _attachmentsService;
    private readonly LessonProgressService _progressService;
    private readonly TokenService _tokenService;

    public event PropertyChangedEventHandler? PropertyChanged;

    public int LessonId { get; private set; }

    private bool _isBusy;
    private string? _error;

    private int _progressPercent;
    public int ProgressPercent
    {
        get => _progressPercent;
        set
        {
            if (_progressPercent == value) return;
            _progressPercent = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(ProgressText));
        }
    }

    public string ProgressText => $"Progress: {ProgressPercent}%";

    public string LessonTitle { get; private set; } = "Lesson";

    public bool IsBusy
    {
        get => _isBusy;
        set
        {
            if (_isBusy == value) return;
            _isBusy = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(IsNotBusy));
        }
    }
    public bool IsNotBusy => !IsBusy;

    public string? Error
    {
        get => _error;
        set
        {
            if (_error == value) return;
            _error = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(HasError));
        }
    }
    public bool HasError => !string.IsNullOrWhiteSpace(Error);

    public List<LessonBlockBaseViewModel> Blocks { get; private set; } = [];
    public List<LessonAttachmentItem> Attachments { get; private set; } = [];

    public bool ShowAttachments => Attachments.Count > 0;

    private HashSet<int> _completedBlockIds = new();
    private int _totalInteractive = 0;

    public bool ShowCompletedBadge => _totalInteractive > 0;
    public string CompletedText => _totalInteractive > 0
        ? $"Completed: {_completedBlockIds.Count}/{_totalInteractive}"
        : "";

    public ICommand OpenAttachmentCommand { get; }
    public ICommand FinishCommand { get; }

    public LessonDetailViewModel(
        LessonService lessonService,
        LessonContentBlockService blocksService,
        LessonAttachmentService attachmentsService,
        LessonProgressService progressService,
        TokenService tokenService)
    {
        _lessonService = lessonService;
        _blocksService = blocksService;
        _attachmentsService = attachmentsService;
        _progressService = progressService;
        _tokenService = tokenService;

        OpenAttachmentCommand = new Command<LessonAttachmentItem>(async (a) => await OpenAttachmentAsync(a));
        FinishCommand = new Command(async () => await FinishAsync());
    }

    private async Task FinishAsync()
    {
        try
        {
            await Shell.Current.GoToAsync("..");
        }
        catch
        {
            await Shell.Current.GoToAsync("//home");
        }
    }

    public void ApplyQueryAttributes(IDictionary<string, object> query)
    {
        if (query.TryGetValue("lessonId", out var raw) &&
            int.TryParse(raw?.ToString(), out var id))
        {
            LessonId = id;
            OnPropertyChanged(nameof(LessonId));
        }
    }

    public async Task LoadAsync()
    {
        if (IsBusy) return;

        var token = await _tokenService.GetAccessTokenAsync();
        if (string.IsNullOrWhiteSpace(token))
            return;

        if (LessonId <= 0)
        {
            Error = "Nieprawidłowe ID lekcji.";
            return;
        }

        try
        {
            IsBusy = true;
            Error = null;

            _completedBlockIds = new HashSet<int>();
            _totalInteractive = 0;
            ProgressPercent = 0;
            OnPropertyChanged(nameof(CompletedText));
            OnPropertyChanged(nameof(ShowCompletedBadge));
            await SafeSendProgressAsync(0);

            var lessonTask = _lessonService.GetAsync(LessonId);
            var blocksTask = _blocksService.GetForLessonAsync(LessonId);
            var attTask = _attachmentsService.GetForLessonAsync(LessonId);

            await Task.WhenAll(lessonTask, blocksTask, attTask);

            LessonDto? lesson = lessonTask.Result;
            LessonTitle = string.IsNullOrWhiteSpace(lesson?.Title) ? "Lesson" : lesson!.Title;
            OnPropertyChanged(nameof(LessonTitle));

            var rawBlocks = (blocksTask.Result ?? [])
                .Where(b => b.IsActive)
                .OrderBy(b => b.OrderIndex)
                .ToList();

            Blocks = rawBlocks.Select(BuildBlockVm).ToList();
            OnPropertyChanged(nameof(Blocks));

            OnPropertyChanged(nameof(CompletedText));
            OnPropertyChanged(nameof(ShowCompletedBadge));

            var atts = (attTask.Result ?? [])
                .Where(a => a.IsActive)
                .Select(a => new LessonAttachmentItem(a))
                .ToList();

            Attachments = atts;
            OnPropertyChanged(nameof(Attachments));
            OnPropertyChanged(nameof(ShowAttachments));
        }
        catch
        {
            Error = "Failed to load lesson content.";
            Blocks = [];
            Attachments = [];
            OnPropertyChanged(nameof(Blocks));
            OnPropertyChanged(nameof(Attachments));
            OnPropertyChanged(nameof(ShowAttachments));
        }
        finally
        {
            IsBusy = false;
        }
    }

    private LessonBlockBaseViewModel BuildBlockVm(LessonContentBlockDto b)
    {
        var type = (b.BlockType ?? "").Trim().ToLowerInvariant();

        if (type == "text")
        {
            var text = BlockContentParser.GetText(b.Content);
            return new TextBlockViewModel(b.Id, text);
        }

        if (type == "single_choice")
        {
            _totalInteractive++;
            var content = BlockContentParser.ParseSingleChoice(b.Content);
            return new SingleChoiceBlockViewModel(b.Id, content, OnBlockCompleted);
        }

        if (type == "fill_blank")
        {
            _totalInteractive++;
            var content = BlockContentParser.ParseFillBlank(b.Content);
            return new FillBlankBlockViewModel(b.Id, content, OnBlockCompleted);
        }

        // fallback: traktuj jako text
        var fallback = BlockContentParser.GetText(b.Content);
        return new TextBlockViewModel(b.Id, fallback);
    }

    private void OnBlockCompleted(int blockId)
    {
        if (_completedBlockIds.Contains(blockId))
            return;

        _completedBlockIds.Add(blockId);

        var nextPercent = ComputeProgress(_completedBlockIds.Count, _totalInteractive);
        ProgressPercent = nextPercent;

        OnPropertyChanged(nameof(CompletedText));
        OnPropertyChanged(nameof(ShowCompletedBadge));

        _ = SafeSendProgressAsync(nextPercent); 
    }

    private static int ComputeProgress(int completedCount, int totalInteractive)
    {
        if (totalInteractive <= 0) return 0;
        var raw = completedCount / (double)totalInteractive * 100.0;
        return (int)Math.Round(raw, MidpointRounding.AwayFromZero);
    }

    private async Task OpenAttachmentAsync(LessonAttachmentItem? item)
    {
        if (item == null) return;

        try
        {
            var url = item.FileUrl.StartsWith("/")
                ? $"{ApiClient.PublicBaseUrl}{item.FileUrl}"
                : item.FileUrl;

            await Launcher.Default.OpenAsync(url);
        }
        catch
        {
            await Shell.Current.DisplayAlert("Błąd", "Nie udało się otworzyć pliku.", "OK");
        }
    }

    private async Task SafeSendProgressAsync(int percent)
    {
        try
        {
            await _progressService.CreateOrUpdateAsync(new LessonProgressDto
            {
                LessonId = LessonId,
                ProgressPercent = percent
            });
        }
        catch
        {
           
        }
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}

public class LessonAttachmentItem
{
    public int Id { get; }
    public string FileName { get; }
    public string? Description { get; }
    public string FileUrl { get; }

    public bool HasDescription => !string.IsNullOrWhiteSpace(Description);

    public LessonAttachmentItem(LessonAttachmentDto dto)
    {
        Id = dto.Id;
        FileName = dto.FileName;
        Description = dto.Description;
        FileUrl = dto.FileUrl;
    }
}
