# update-readme.ps1
# This script updates the README.md file on all local branches
# with the latest version from feature/vmr-module-finalization

$sourceBranch = "feature/vmr-module-finalization"
$skipBranches = @("main", "develop", $sourceBranch)

Write-Host "Fetching all branch info..." -ForegroundColor Cyan
git fetch --all | Out-Null

# Get all local branches except skipped ones
$branches = git branch | ForEach-Object { $_.Trim().Replace("* ", "") } | Where-Object { $_ -notin $skipBranches }

Write-Host "Found $($branches.Count) branches to update." -ForegroundColor Yellow

foreach ($branch in $branches) {
    Write-Host "`nSwitching to: $branch" -ForegroundColor Cyan
    git checkout $branch | Out-Null

    # Copy README from the finalized branch
    git checkout $sourceBranch -- README.md | Out-Null

    # Check if README actually changed
    $status = git status --short
    if ($status) {
        git add README.md | Out-Null
        git commit -m "Update README for Vehicle Maintenance & Rentals module (Student A)" | Out-Null
        git push origin $branch | Out-Null
        Write-Host "  Updated and pushed." -ForegroundColor Green
    } else {
        Write-Host "  No change needed." -ForegroundColor Gray
    }
}

# Switch back to working branch
Write-Host "`nSwitching back to $sourceBranch..." -ForegroundColor Cyan
git checkout $sourceBranch | Out-Null
Write-Host "Done! All branches updated." -ForegroundColor Green
