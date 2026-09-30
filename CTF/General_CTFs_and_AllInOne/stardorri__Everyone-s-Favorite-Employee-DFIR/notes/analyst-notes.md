# Analyst Notes

## Investigation Approach

The investigation focused on filesystem artifacts, user-created files, shell history, and system logs.

Key investigative steps included:

1. Reviewing the disk image in FTK Imager.
2. Checking user directories such as `/root/Desktop`, `/root/Documents`, and `/root/Downloads`.
3. Reviewing `.bash_history` to reconstruct user activity.
4. Checking Apache logs in `/var/log/apache2/`.
5. Identifying disguised or suspicious files.
6. Correlating user activity with log evidence.

## Lessons Learned

- File extensions are not reliable indicators of file type.
- Bash history can provide strong evidence of user activity.
- Empty log files may be significant depending on context.
- Tools like Mimikatz and FlightSim can be legitimate in labs but suspicious in unauthorized environments.
- Reports should separate observed evidence from analyst interpretation.
