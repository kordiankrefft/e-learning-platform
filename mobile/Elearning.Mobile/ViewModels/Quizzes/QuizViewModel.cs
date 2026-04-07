using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Elearning.Mobile.Dtos.Quiz;
using Elearning.Mobile.Dtos.QuizAttempt;
using Elearning.Mobile.Dtos.QuizAttemptAnswer;
using Elearning.Mobile.Dtos.QuizTake;
using Elearning.Mobile.Services;
using Elearning.Mobile.Services.Auth;

namespace Elearning.Mobile.ViewModels.Quizzes;

public class QuizViewModel : INotifyPropertyChanged, IQueryAttributable
{
    private readonly QuizService _quizService;
    private readonly QuizTakeService _takeService;
    private readonly QuizAttemptService _attemptsService;
    private readonly QuizAttemptAnswerService _answersService;
    private readonly TokenService _tokenService;

    public event PropertyChangedEventHandler? PropertyChanged;

    public int ModuleId { get; private set; }

    private bool _isBusy;
    private string? _error;

    private int? _timeLimitSeconds;
    private int? _remainingSeconds;
    private CancellationTokenSource? _timerCts;

    private int _attemptId;
    private int _quizId;

    private bool _isSubmitting;

    public bool IsBusy
    {
        get => _isBusy;
        set
        {
            if (_isBusy == value) return;
            _isBusy = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(IsNotBusy));
            RaiseHeaderFlags();
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

    public string Title { get; private set; } = "Quiz";
    public string? Description { get; private set; }
    public bool HasDescription => !string.IsNullOrWhiteSpace(Description);

    public int? MaxAttempts { get; private set; }
    public bool ShowMaxAttempts => MaxAttempts != null;
    public string MaxAttemptsText => MaxAttempts != null ? $"Max podejść: {MaxAttempts}" : "";

    public List<QuizQuestionViewModel> Questions { get; private set; } = [];

    public int AnsweredCount => Questions.Count(q => q.SelectedOptionId != null);
    public int TotalCount => Questions.Count;
    public string AnswersText => $"Odpowiedzi: {AnsweredCount}/{TotalCount}";

    public bool ShowTimer => _timeLimitSeconds != null && _timeLimitSeconds > 0;

    public string TimerText => ShowTimer
        ? $"Czas: {FormatSeconds(_remainingSeconds ?? _timeLimitSeconds!.Value)}"
        : "";

    public bool ShowSubmit => TotalCount > 0;
    public bool CanSubmit => !_isSubmitting && !IsBusy && TotalCount > 0;

    public string SubmitButtonText => _isSubmitting ? "Wysyłanie..." : "Zakończ quiz";

    public ICommand SubmitCommand { get; }
    public ICommand BackCommand { get; }

    public QuizViewModel(
        QuizService quizService,
        QuizTakeService takeService,
        QuizAttemptService attemptsService,
        QuizAttemptAnswerService answersService,
        TokenService tokenService)
    {
        _quizService = quizService;
        _takeService = takeService;
        _attemptsService = attemptsService;
        _answersService = answersService;
        _tokenService = tokenService;

        SubmitCommand = new Command(async () => await SubmitAsync(isAutoSubmit: false));
        BackCommand = new Command(async () =>
        {
            StopTimer();
            await Shell.Current.GoToAsync("..");
        });
    }

    public void ApplyQueryAttributes(IDictionary<string, object> query)
    {
        if (query.TryGetValue("moduleId", out var raw) &&
            int.TryParse(raw?.ToString(), out var id))
        {
            ModuleId = id;
            OnPropertyChanged(nameof(ModuleId));
        }
    }

    public async Task LoadAsync()
    {
        if (IsBusy) return;

        var token = await _tokenService.GetAccessTokenAsync();
        if (string.IsNullOrWhiteSpace(token))
            return;

        if (ModuleId <= 0)
        {
            Error = "Nieprawidłowe moduleId.";
            return;
        }

        try
        {
            IsBusy = true;
            Error = null;

            QuizDto? quiz = await _quizService.GetModuleQuizAsync(ModuleId);
            if (quiz == null || quiz.Id <= 0)
            {
                Error = "Brak quizu dla tego modułu.";
                Questions = [];
                OnPropertyChanged(nameof(Questions));
                RaiseHeaderFlags();
                return;
            }

            _quizId = quiz.Id;

            QuizTakeDto? take = await _takeService.GetQuizTakeAsync(_quizId);
            if (take == null)
            {
                Error = "Nie udało się pobrać quizu.";
                return;
            }

            Title = string.IsNullOrWhiteSpace(take.Title) ? "Quiz" : take.Title;
            Description = take.Description;
            MaxAttempts = take.MaxAttempts;

            _timeLimitSeconds = take.TimeLimitSeconds != null && take.TimeLimitSeconds > 0
                ? take.TimeLimitSeconds
                : null;

            _remainingSeconds = _timeLimitSeconds;

            var sorted = (take.Questions ?? [])
                .OrderBy(q => q.OrderIndex)
                .ToList();

            Questions = sorted.Select(q => new QuizQuestionViewModel(q, OnAnswerChanged)).ToList();
            OnPropertyChanged(nameof(Questions));

            _attemptId = await _attemptsService.CreateAsync(_quizId);
            if (_attemptId <= 0)
                throw new Exception("Attempt create returned no attemptId.");

            StartTimerIfNeeded();

            RaiseHeaderFlags();
        }
        catch (Exception ex)
        {
            Error = ex.Message;
        }
        finally
        {
            IsBusy = false;
            RaiseHeaderFlags();
        }
    }

    private void OnAnswerChanged()
    {
        OnPropertyChanged(nameof(AnsweredCount));
        OnPropertyChanged(nameof(AnswersText));
        OnPropertyChanged(nameof(CanSubmit));
    }

    private void RaiseHeaderFlags()
    {
        OnPropertyChanged(nameof(Title));
        OnPropertyChanged(nameof(Description));
        OnPropertyChanged(nameof(HasDescription));
        OnPropertyChanged(nameof(ShowTimer));
        OnPropertyChanged(nameof(TimerText));
        OnPropertyChanged(nameof(AnswersText));
        OnPropertyChanged(nameof(ShowSubmit));
        OnPropertyChanged(nameof(CanSubmit));
        OnPropertyChanged(nameof(ShowMaxAttempts));
        OnPropertyChanged(nameof(MaxAttemptsText));
        OnPropertyChanged(nameof(SubmitButtonText));
    }

    private void StartTimerIfNeeded()
    {
        StopTimer();

        if (!ShowTimer) return;
        if (_remainingSeconds == null) return;

        _timerCts = new CancellationTokenSource();
        var ct = _timerCts.Token;

        _ = Task.Run(async () =>
        {
            try
            {
                while (!ct.IsCancellationRequested)
                {
                    await Task.Delay(1000, ct);

                    if (_remainingSeconds == null) break;

                    _remainingSeconds--;

                    MainThread.BeginInvokeOnMainThread(() =>
                    {
                        OnPropertyChanged(nameof(TimerText));
                    });

                    if (_remainingSeconds <= 0)
                    {
                        MainThread.BeginInvokeOnMainThread(async () =>
                        {
                            await SubmitAsync(isAutoSubmit: true);
                        });

                        break;
                    }
                }
            }
            catch
            {

            }
        }, ct);
    }

    public void StopTimer()
    {
        try
        {
            _timerCts?.Cancel();
            _timerCts?.Dispose();
        }
        catch { }
        finally
        {
            _timerCts = null;
        }
    }

    private async Task SubmitAsync(bool isAutoSubmit)
    {
        if (_isSubmitting) return;
        if (_attemptId <= 0) return;
        if (Questions.Count == 0) return;

        var missing = Questions.Where(q => q.SelectedOptionId == null).ToList();
        if (missing.Count > 0 && !isAutoSubmit)
        {
            await Shell.Current.DisplayAlert("Uzupełnij odpowiedzi", $"Brakuje odpowiedzi: {missing.Count}", "OK");
            return;
        }

        try
        {
            _isSubmitting = true;
            RaiseHeaderFlags();

            foreach (var q in Questions)
            {
                var dto = new QuizAttemptAnswerCreateDto
                {
                    QuizQuestionId = q.Id,
                    SelectedOptionId = q.SelectedOptionId,
                    OpenAnswerText = null
                };

                await _answersService.CreateForAttemptAsync(_attemptId, dto);
            }

            QuizAttemptDto? result = await _attemptsService.SubmitAsync(_attemptId);

            StopTimer();

            var passed = result?.Passed == true;
            var scorePercent = result?.ScorePercent ?? 0m;

            if (!isAutoSubmit)
            {
                var title = passed ? "Zdałeś ✅" : "Nie zdałeś ❌";
                var desc = $"Wynik: {Math.Round(scorePercent, 2)}%";
                await Shell.Current.DisplayAlert(title, desc, "OK");
            }
            else
            {

            }

            await Shell.Current.GoToAsync("..");
        }
        catch
        {
            await Shell.Current.DisplayAlert("Błąd", "Nie udało się zapisać odpowiedzi do quizu.", "OK");
        }
        finally
        {
            _isSubmitting = false;
            RaiseHeaderFlags();
        }
    }

    private static string FormatSeconds(int totalSeconds)
    {
        var safe = Math.Max(0, totalSeconds);
        var minutes = safe / 60;
        var seconds = safe % 60;
        return $"{minutes:00}:{seconds:00}";
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}