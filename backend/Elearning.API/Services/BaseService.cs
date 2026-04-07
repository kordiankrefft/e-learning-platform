using Elearning.API.Models.Contexts;

namespace Elearning.API.Services
{
    public class BaseService
    {
        protected DatabaseContext databaseContext;

        public BaseService(DatabaseContext databaseContext)
        {
            this.databaseContext = databaseContext;
        }
    }
}
