param(
  [string]$SmtpUser,
  [string]$SmtpPass,
  [string]$EmailRecipients,
  [string]$BuildNumber,
  [string]$Branch,
  [string]$TestStatus,
  [string]$SuiteName,
  [string]$BuildId,
  [string]$TriggeredBy,
  [string]$JunitPath,
  [string]$BuildUrl,
  [string]$EnvName
)

Add-Type -AssemblyName System.Web

$runDate = (Get-Date).ToUniversalTime().ToString("ddd, MMM dd 'at' h:mm tt 'UTC'")

# ── Parse JUnit XML ──────────────────────────────────────────────
$totalTests = 0; $totalPassed = 0; $totalFailed = 0; $totalSkipped = 0
$totalDuration = 0
$moduleResults = @{}

if (Test-Path $JunitPath) {
  [xml]$junit = Get-Content $JunitPath -Encoding UTF8
  $suites = $junit.testsuites.testsuite

  foreach ($suite in $suites) {
    $sName = $suite.name
    $totalTests += [int]$suite.tests
    $totalFailed += [int]$suite.failures
    $totalSkipped += [int]$suite.skipped
    $totalDuration += [double]$suite.time

    if (-not $moduleResults.ContainsKey($sName)) {
      $moduleResults[$sName] = @{ passed = 0; failed = 0; tests = @() }
    }

    foreach ($tc in $suite.testcase) {
      $tcName = $tc.name -replace '\u203A', '>' 
      $tcName = [System.Web.HttpUtility]::HtmlEncode($tcName)
      $tcTime = [math]::Round([double]$tc.time, 1)
      if ($null -ne $tc.failure) {
        $moduleResults[$sName].failed++
        $errMsg = $tc.failure.message
        if ($errMsg.Length -gt 100) { $errMsg = $errMsg.Substring(0, 100) + "..." }
        $errMsg = [System.Web.HttpUtility]::HtmlEncode($errMsg)
        $moduleResults[$sName].tests += @{ name = $tcName; time = $tcTime; status = "failed"; error = $errMsg }
      } else {
        $moduleResults[$sName].passed++
        $moduleResults[$sName].tests += @{ name = $tcName; time = $tcTime; status = "passed"; error = "" }
      }
    }
  }
  $totalPassed = $totalTests - $totalFailed - $totalSkipped
}

$durationStr = [math]::Round($totalDuration, 1).ToString() + "s"
if ($totalTests -gt 0) { $passRate = [math]::Round(($totalPassed / $totalTests) * 100, 0) } else { $passRate = 0 }
if ($passRate -ge 80) { $barColor = "#22c55e" } elseif ($passRate -ge 50) { $barColor = "#f59e0b" } else { $barColor = "#ef4444" }

# ── Build failed module sections ─────────────────────────────────
$moduleSections = ""
foreach ($modName in $moduleResults.Keys) {
  $mod = $moduleResults[$modName]
  $modPassed = $mod.passed
  $modFailed = $mod.failed

  if ($modFailed -eq 0) { continue }

  $modSummary = "$modFailed failed, $modPassed passed"

  $testRows = ""
  foreach ($t in $mod.tests) {
    if ($t.status -eq "passed") { continue }
    $icon = "<span style='color:#ef4444;margin-right:8px;'>&#10007;</span>"
    $testRows += "<tr><td style='padding:8px 16px 8px 32px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;'>$icon$($t.name)</td><td style='padding:8px 16px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#9ca3af;text-align:right;'>$($t.time)s</td></tr>"
    if ($t.error -ne "") {
      $testRows += "<tr><td colspan='2' style='padding:4px 16px 10px 56px;font-size:11px;color:#ef4444;border-bottom:1px solid #f3f4f6;'>$($t.error)</td></tr>"
    }
  }

  $moduleSections += @"
  <table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom:16px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;'>
    <tr><td style='padding:14px 16px;background:#fff;'>
      <table width='100%' cellpadding='0' cellspacing='0'><tr>
        <td style='vertical-align:middle;'><span style='font-weight:600;font-size:14px;color:#111827;'>$modName</span><br><span style='font-size:12px;color:#6b7280;'>$modSummary</span></td>
        <td align='right' style='vertical-align:middle;'><span style='background:#fef2f2;color:#ef4444;padding:4px 12px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:0.5px;'>FAILED</span></td>
      </tr></table>
    </td></tr>
    $testRows
  </table>
"@
}

# ── Failed tests section (only if there are failures) ────────────
$failedTestsSection = ""
if ($moduleSections -ne "") {
  $failedTestsSection = @"
  <!-- Failed Tests Section -->
  <tr><td style='padding:0 36px 28px 36px;'>
    <table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom:16px;'>
      <tr><td style='padding:16px 0 12px 4px;border-left:4px solid #ef4444;padding-left:16px;'>
        <span style='font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1.2px;'>Failed Tests</span>
      </td></tr>
    </table>
    $moduleSections
  </td></tr>
"@
}

# ── Build HTML email body ────────────────────────────────────────
$body = @"
<!DOCTYPE html>
<html><head><meta charset='utf-8'></head>
<body style='margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;'>
  <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background:#f3f4f6;padding:32px 0;'>
    <tr><td align='center'>
      <table role='presentation' width='620' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;'>

        <!-- Header -->
        <tr><td style='padding:32px 36px 20px 36px;border-bottom:1px solid #f3f4f6;'>
          <table width='100%'><tr>
            <td><span style='font-size:22px;font-weight:700;color:#111827;'>Procore Integrations Test Report</span></td>
            <td align='right' style='font-size:13px;color:#9ca3af;'>$runDate</td>
          </tr></table>
          <p style='margin:6px 0 0;font-size:14px;color:#6b7280;'>Automated execution summary for the <strong style='color:#111827;'>$SuiteName</strong> suite on <strong style='color:#111827;'>$EnvName</strong>.</p>
        </td></tr>

        <!-- SUMMARY Section -->
        <tr><td style='padding:28px 36px 0 36px;'>
          <table width='100%' cellpadding='0' cellspacing='0' style='border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;'>
            <tr><td style='padding:16px 20px;border-bottom:1px solid #f3f4f6;border-left:4px solid #22c55e;'>
              <span style='font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1.2px;'>Summary</span>
            </td></tr>
            <tr><td style='padding:20px 20px 16px 24px;'>
              <span style='font-size:12px;color:#9ca3af;'>Pass Rate</span><br>
              <table width='100%' cellpadding='0' cellspacing='0' style='margin-top:8px;'>
                <tr>
                  <td width='60' style='font-size:28px;font-weight:700;color:$barColor;vertical-align:middle;'>$passRate%</td>
                  <td style='vertical-align:middle;padding-left:12px;'>
                    <div style='background:#e5e7eb;border-radius:6px;height:12px;overflow:hidden;'>
                      <div style='background:$barColor;height:12px;width:$passRate%;border-radius:6px;'></div>
                    </div>
                  </td>
                </tr>
              </table>
            </td></tr>
            <tr><td style='padding:8px 20px 20px 20px;'>
              <table width='100%' cellpadding='0' cellspacing='0'>
                <tr>
                  <td width='25%' style='text-align:center;padding:16px 0;border:1px solid #e5e7eb;border-radius:8px 0 0 8px;'>
                    <div style='font-size:28px;font-weight:700;color:#111827;'>$totalTests</div>
                    <div style='font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-top:4px;'>Total</div>
                  </td>
                  <td width='25%' style='text-align:center;padding:16px 0;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;'>
                    <div style='font-size:28px;font-weight:700;color:#22c55e;'>$totalPassed</div>
                    <div style='font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-top:4px;'>Passed</div>
                  </td>
                  <td width='25%' style='text-align:center;padding:16px 0;border:1px solid #e5e7eb;border-left:none;border-right:none;'>
                    <div style='font-size:28px;font-weight:700;color:#ef4444;'>$totalFailed</div>
                    <div style='font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-top:4px;'>Failed</div>
                  </td>
                  <td width='25%' style='text-align:center;padding:16px 0;border:1px solid #e5e7eb;border-radius:0 8px 8px 0;'>
                    <div style='font-size:28px;font-weight:700;color:#f59e0b;'>$totalSkipped</div>
                    <div style='font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-top:4px;'>Skipped</div>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- RUN INFORMATION Section -->
        <tr><td style='padding:24px 36px 0 36px;'>
          <table width='100%' cellpadding='0' cellspacing='0' style='border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;'>
            <tr><td style='padding:16px 20px;border-bottom:1px solid #f3f4f6;border-left:4px solid #22c55e;'>
              <span style='font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1.2px;'>Run Information</span>
            </td></tr>
            <tr><td style='padding:20px 24px;'>
              <table width='100%' cellpadding='0' cellspacing='0'>
                <tr>
                  <td width='50%' style='padding:6px 0;'><span style='font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;'>Build</span><br><span style='font-size:14px;font-weight:500;color:#111827;'>#$BuildNumber</span></td>
                  <td width='50%' style='padding:6px 0;'><span style='font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;'>Triggered By</span><br><span style='font-size:14px;font-weight:500;color:#111827;'>$TriggeredBy</span></td>
                </tr>
                <tr>
                  <td style='padding:12px 0 6px;'><span style='font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;'>Environment</span><br><span style='font-size:14px;font-weight:500;color:#111827;'>$EnvName</span></td>
                  <td style='padding:12px 0 6px;'><span style='font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;'>Started</span><br><span style='font-size:14px;font-weight:500;color:#111827;'>$runDate</span></td>
                </tr>
                <tr>
                  <td style='padding:12px 0 6px;'><span style='font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;'>Suite</span><br><span style='font-size:14px;font-weight:500;color:#111827;'>$SuiteName</span></td>
                  <td style='padding:12px 0 6px;'><span style='font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;'>Duration</span><br><span style='font-size:14px;font-weight:500;color:#111827;'>$durationStr</span></td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- View Report Button -->
        <tr><td style='padding:28px 36px;' align='center'>
          <a href='$BuildUrl' style='display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:14px;font-weight:600;'>View Detailed Report &#8594;</a>
        </td></tr>

        $failedTestsSection

        <!-- Footer -->
        <tr><td style='background:#f9fafb;padding:20px 36px;border-top:1px solid #e5e7eb;'>
          <table width='100%'><tr>
            <td style='font-size:11px;color:#9ca3af;'>Procore Integrations QA Automation</td>
            <td align='right' style='font-size:11px;color:#9ca3af;'>Powered by Playwright</td>
          </tr></table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>
"@

# ── Send email ───────────────────────────────────────────────────
$securePass = ConvertTo-SecureString $SmtpPass -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential($SmtpUser, $securePass)

if ($totalFailed -gt 0) { $statusLabel = "FAILED" } else { $statusLabel = "PASSED" }
$subject = "[$statusLabel] Procore Integrations Test Report - $SuiteName Suite - #$BuildNumber"

Write-Host "Sending email to $($EmailRecipients -split ',' -join ', ')..."

Send-MailMessage `
  -To ($EmailRecipients -split ',') `
  -From $SmtpUser `
  -Subject $subject `
  -Body $body `
  -BodyAsHtml `
  -Encoding UTF8 `
  -SmtpServer "smtp.gmail.com" `
  -Port 587 `
  -UseSsl `
  -Credential $cred

Write-Host "Email sent successfully."
