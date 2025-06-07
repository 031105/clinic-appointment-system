# Database Setup Directory

This directory contains all the necessary files to set up the Clinic Appointment System database on a new machine with **complete automation**.

## 🚀 ONE-CLICK DEPLOYMENT (Recommended)

### Super Simple - Just One Command!

```bash
cd db_setup
./DEPLOY_EVERYTHING.sh
```

**That's it!** This script will:
- ✅ Detect your operating system
- ✅ Install PostgreSQL automatically
- ✅ Configure PostgreSQL service
- ✅ Set up database user and permissions
- ✅ Create and populate the clinic database
- ✅ Verify everything works

**Supported Systems:** Ubuntu, CentOS, Fedora, macOS, Windows (with manual PostgreSQL install)

## 🛠️ Alternative Deployment Methods

### Advanced Automated Setup

```bash
cd db_setup
./deploy.sh
```

This gives you more control and detailed output during the deployment process.

### Database-Only Setup (PostgreSQL already installed)

```bash
cd db_setup
./setup_database.sh
```

Use this if PostgreSQL is already installed and you just need to set up the database.

### Manual Setup

```bash
cd db_setup

# Option 1: Complete restore
createdb -U postgres clinic_appointment_system
psql -U postgres -d clinic_appointment_system -f complete_database_backup.sql

# Option 2: Step by step
createdb -U postgres clinic_appointment_system
psql -U postgres -d clinic_appointment_system -f database_schema.sql
psql -U postgres -d clinic_appointment_system -f database_data.sql
psql -U postgres -d clinic_appointment_system -f ../setup-admin-settings.sql
```

## 📁 Files Included

| File | Description |
|------|-------------|
| **`DEPLOY_EVERYTHING.sh`** | 🎯 **ONE-CLICK DEPLOYMENT** - Run this for automatic everything! |
| **`deploy.sh`** | 🔧 **Master deployment script** - Installs PostgreSQL + database |
| `setup_database.sh` | Database setup only (PostgreSQL required) |
| `database_setup_guide.md` | Comprehensive setup guide and documentation |
| `complete_database_backup.sql` | Complete database backup (schema + data) |
| `database_schema.sql` | Database structure only (tables, functions, triggers) |
| `database_data.sql` | Data only (INSERT statements) |
| `database_env_template.txt` | Environment variables template |
| `DEPLOYMENT_SUMMARY.md` | Complete deployment overview |
| `README.md` | This file |

## ⚡ Quick Start (Zero Configuration)

1. **Copy the entire `db_setup` folder** to your target machine
2. **Open terminal** and navigate to the folder:
   ```bash
   cd path/to/db_setup
   ```
3. **Run the one-click deployment**:
   ```bash
   ./DEPLOY_EVERYTHING.sh
   ```
4. **Follow the prompts** (just press 'y' when asked)
5. **Done!** Your database is ready to use

## 🔧 System Requirements

- **Supported OS**: Ubuntu, Debian, CentOS, Fedora, macOS
- **Privileges**: sudo access (for PostgreSQL installation)
- **Disk Space**: ~50MB for PostgreSQL + database
- **Network**: Internet connection for package downloads

## ✅ What Gets Installed & Configured

- ✅ PostgreSQL server (latest version)
- ✅ PostgreSQL service (auto-start enabled)
- ✅ Database user with proper permissions
- ✅ Complete clinic database with all tables
- ✅ All data, settings, and configurations
- ✅ Proper authentication setup

## 🔍 Verification

After deployment, the script will show you:
- ✅ Connection details
- ✅ Connection string
- ✅ Quick test command

You can verify manually:
```sql
psql -h localhost -p 5432 -U postgres -d clinic_appointment_system
\dt  -- List all tables
SELECT COUNT(*) FROM users;  -- Check data
```

## 🆘 Troubleshooting

**If deployment fails:**
1. Make sure you have sudo privileges
2. Check internet connection (for package downloads)
3. Try running individual scripts:
   - `./deploy.sh` for detailed output
   - `./setup_database.sh` if PostgreSQL is already installed

**For detailed help:**
- Read `database_setup_guide.md`
- Check `DEPLOYMENT_SUMMARY.md`

## 🔒 Security Notes

⚠️ **Important**: The scripts use default passwords for easy setup. For production:

- Change default passwords
- Configure firewall rules
- Enable SSL connections
- Set up regular backups

## 🎯 Success Indicators

You'll know it worked when you see:
```
✅ PostgreSQL is installed and running
✅ Database 'clinic_appointment_system' has been created and populated
✅ All tables, data, and settings have been imported
🎉 DEPLOYMENT COMPLETE! Your clinic system database is ready!
```

---

**Need help?** Check the comprehensive guides in this directory or verify all required files are present. 