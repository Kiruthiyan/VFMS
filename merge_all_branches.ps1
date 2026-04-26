# Stop execution on error, but we handle git merge errors manually
$ErrorActionPreference = "Continue"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " Starting Safe Branch Merge Process" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  ERROR: You have uncommitted changes in your current branch." -ForegroundColor Red
    Write-Host "Please commit or stash your changes before running this script." -ForegroundColor Yellow
    exit
}

# 2. Fetch all branches from remote
Write-Host "Fetching latest updates from remote..." -ForegroundColor Blue
git fetch --all

# 3. Determine base branch (main or master)
$baseBranch = "main"
if (!(git show-ref --verify --quiet refs/heads/main)) {
    if (git show-ref --verify --quiet refs/heads/master) {
        $baseBranch = "master"
    } else {
        Write-Host "⚠️  ERROR: Could not find 'main' or 'master' branch to use as a base." -ForegroundColor Red
        exit
    }
}

# 4. Checkout base branch and pull latest
Write-Host "Checking out base branch: $baseBranch" -ForegroundColor Blue
git checkout $baseBranch
git pull origin $baseBranch

# 5. Create new integration branch
$newBranch = "integration-kiruthiyan"
Write-Host "Creating and switching to new branch: $newBranch" -ForegroundColor Blue
git checkout -b $newBranch

function Merge-Branch {
    param (
        [string]$BranchToMerge
    )
    
    Write-Host ""
    Write-Host "======================================================" -ForegroundColor Cyan
    Write-Host " Merging branch: $BranchToMerge" -ForegroundColor Cyan
    Write-Host "======================================================" -ForegroundColor Cyan
    
    # Check if branch exists
    if (!(git ls-remote --heads origin $BranchToMerge) -and !(git show-ref --verify --quiet "refs/heads/$BranchToMerge")) {
        Write-Host "⚠️  WARNING: Branch '$BranchToMerge' not found on local or remote. Skipping." -ForegroundColor Yellow
        return
    }

    # Execute merge with --no-ff to keep history clear and leave original branch untouched
    git merge origin/$BranchToMerge --no-ff -m "Merge branch '$BranchToMerge' into $newBranch"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ MERGE CONFLICT DETECTED in $BranchToMerge!" -ForegroundColor Red
        Write-Host "The script has paused because Git doesn't know how to merge some files." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "WHAT YOU NEED TO DO:" -ForegroundColor White
        Write-Host "1. Open your IDE (VS Code, IntelliJ, etc)." -ForegroundColor White
        Write-Host "2. Find the files with conflicts (they will be highlighted)." -ForegroundColor White
        Write-Host "3. Resolve the conflicts manually." -ForegroundColor White
        Write-Host "4. Run 'git add .' to stage the resolved files." -ForegroundColor White
        Write-Host "5. Run 'git commit -m `"Resolve conflicts with $BranchToMerge`"'." -ForegroundColor White
        Write-Host "6. Run this script AGAIN to continue merging the remaining branches." -ForegroundColor White
        Write-Host ""
        exit 1
    } else {
        Write-Host "✅ Successfully merged $BranchToMerge" -ForegroundColor Green
    }
}

# 6. Merge the three branches one by one
Merge-Branch -BranchToMerge "user-auth"
Merge-Branch -BranchToMerge "user-management"
Merge-Branch -BranchToMerge "feature/fuel-management"

# 7. Final Success
Write-Host ""
Write-Host "🎉 ALL BRANCHES MERGED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "You are now on the '$newBranch' branch." -ForegroundColor Green
Write-Host "The original branches (user-auth, user-management, feature/fuel-management) are completely untouched." -ForegroundColor Cyan
Write-Host ""
Write-Host "To push this new combined branch to GitHub, run:" -ForegroundColor White
Write-Host "git push -u origin $newBranch" -ForegroundColor Yellow
