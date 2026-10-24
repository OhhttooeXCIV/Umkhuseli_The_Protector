package com.example.ui.safehaven

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Draw
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Sort
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.data.local.entity.IncidentEntity
import com.example.data.local.entity.UserProfileEntity
import com.example.service.PdfPrintHelper
import com.example.ui.components.SignaturePadDialog
import com.example.ui.theme.SafetyAmber
import com.example.ui.theme.SafetyGreen
import com.example.ui.theme.SafetyRed
import com.example.ui.theme.SankofaCardBg
import com.example.ui.theme.SankofaGold
import com.example.ui.theme.SankofaGoldLight
import com.example.ui.theme.SankofaSurface
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import kotlinx.coroutines.launch

enum class SortOrder {
    DATE_DESC,
    DATE_ASC,
    SEVERITY_DESC,
    SEVERITY_ASC
}

/**
 * Pure filtering and sorting engine for Form 2 Protection Order incidents.
 * Filters by abuse category and SAPS OB status, then sorts by timestamp or severity.
 */
fun filterAndSortIncidents(
    incidents: List<IncidentEntity>,
    sortOrder: SortOrder = SortOrder.DATE_DESC,
    selectedTypeFilter: String = "All",
    filterByPoliceOb: Boolean = false
): List<IncidentEntity> {
    var list = incidents

    if (selectedTypeFilter != "All") {
        list = list.filter { it.incidentType.equals(selectedTypeFilter, ignoreCase = true) }
    }

    if (filterByPoliceOb) {
        list = list.filter { it.policeObNumber.isNotBlank() }
    }

    return when (sortOrder) {
        SortOrder.DATE_DESC -> list.sortedByDescending { it.timestamp }
        SortOrder.DATE_ASC -> list.sortedBy { it.timestamp }
        SortOrder.SEVERITY_DESC -> list.sortedByDescending { it.severityLevel }
        SortOrder.SEVERITY_ASC -> list.sortedBy { it.severityLevel }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Form2RecordViewer(
    incidents: List<IncidentEntity>,
    userProfile: UserProfileEntity?,
    onDismiss: () -> Unit,
    onSaveUserProfile: (UserProfileEntity) -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    // Filter & Sort States
    var sortOrder by remember { mutableStateOf(SortOrder.DATE_DESC) }
    var selectedTypeFilter by remember { mutableStateOf("All") }
    var filterByPoliceOb by remember { mutableStateOf(false) }
    var showFilterSheet by remember { mutableStateOf(false) }

    // Complainant Attachment States
    var attachComplainantDetails by remember { mutableStateOf(true) }
    var showEditProfileDialog by remember { mutableStateOf(false) }
    var showSignaturePad by remember { mutableStateOf(false) }

    // Filter & Sort Logic
    val filteredIncidents by remember(incidents, sortOrder, selectedTypeFilter, filterByPoliceOb) {
        derivedStateOf {
            filterAndSortIncidents(incidents, sortOrder, selectedTypeFilter, filterByPoliceOb)
        }
    }

    val pagerState = rememberPagerState(pageCount = { filteredIncidents.size.coerceAtLeast(1) })

    val pdfPrintHelper = remember { PdfPrintHelper(context) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = Color(0xFF090A0F)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 14.dp, vertical = 10.dp)
            ) {
                // Top Action Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close Viewer",
                            tint = Color.White
                        )
                    }

                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "FORM 2 PROTECTION ORDER",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = SankofaGold,
                                letterSpacing = 1.sp
                            )
                        )
                        Text(
                            text = if (filteredIncidents.isEmpty()) "0 Records" else "Record ${pagerState.currentPage + 1} of ${filteredIncidents.size}",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White
                            )
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        IconButton(onClick = { showFilterSheet = true }) {
                            Box {
                                Icon(
                                    imageVector = Icons.Default.FilterList,
                                    contentDescription = "Sort and Filter",
                                    tint = if (selectedTypeFilter != "All" || filterByPoliceOb || sortOrder != SortOrder.DATE_DESC) SankofaGold else Color.White
                                )
                                if (selectedTypeFilter != "All" || filterByPoliceOb || sortOrder != SortOrder.DATE_DESC) {
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .background(SafetyAmber, CircleShape)
                                            .align(Alignment.TopEnd)
                                    )
                                }
                            }
                        }

                        IconButton(
                            onClick = {
                                pdfPrintHelper.printForm2Dossier(
                                    complainant = userProfile,
                                    incidents = filteredIncidents,
                                    attachComplainantDetails = attachComplainantDetails
                                )
                            },
                            enabled = filteredIncidents.isNotEmpty()
                        ) {
                            Icon(
                                imageVector = Icons.Default.Print,
                                contentDescription = "Export to PDF / Print",
                                tint = SankofaGold
                            )
                        }
                    }
                }

                // Complainant Details Bar (Statutory Requirement)
                ComplainantParticularsBar(
                    userProfile = userProfile,
                    attachDetails = attachComplainantDetails,
                    onToggleAttach = { attachComplainantDetails = it },
                    onEditProfile = { showEditProfileDialog = true },
                    onSign = { showSignaturePad = true }
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Swipeable Incident Carousel
                if (filteredIncidents.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Default.Shield,
                                contentDescription = null,
                                tint = Color(0xFF334155),
                                modifier = Modifier.size(64.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "No matching incident records found",
                                color = TextSecondary,
                                fontSize = 14.sp
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Button(
                                onClick = {
                                    selectedTypeFilter = "All"
                                    filterByPoliceOb = false
                                    sortOrder = SortOrder.DATE_DESC
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))
                            ) {
                                Text("Clear Filters", color = Color.White)
                            }
                        }
                    }
                } else {
                    Box(modifier = Modifier.weight(1f)) {
                        HorizontalPager(
                            state = pagerState,
                            modifier = Modifier.fillMaxSize()
                        ) { page ->
                            val incident = filteredIncidents[page]
                            SwipeableIncidentDossierCard(
                                incident = incident,
                                pageIndex = page,
                                totalCount = filteredIncidents.size
                            )
                        }
                    }

                    // Pager Navigation Arrows & Indicator
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(
                            onClick = {
                                coroutineScope.launch {
                                    if (pagerState.currentPage > 0) {
                                        pagerState.animateScrollToPage(pagerState.currentPage - 1)
                                    }
                                }
                            },
                            enabled = pagerState.currentPage > 0
                        ) {
                            Icon(
                                imageVector = Icons.Default.ArrowBack,
                                contentDescription = "Previous Record",
                                tint = if (pagerState.currentPage > 0) Color.White else Color(0xFF334155)
                            )
                        }

                        // Export / Print CTA Button
                        Button(
                            onClick = {
                                pdfPrintHelper.printForm2Dossier(
                                    complainant = userProfile,
                                    incidents = filteredIncidents,
                                    attachComplainantDetails = attachComplainantDetails
                                )
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = SankofaGold),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.height(44.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Print, contentDescription = null, tint = Color(0xFF0F172A))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Print / Export Court PDF",
                                color = Color(0xFF0F172A),
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }

                        IconButton(
                            onClick = {
                                coroutineScope.launch {
                                    if (pagerState.currentPage < filteredIncidents.size - 1) {
                                        pagerState.animateScrollToPage(pagerState.currentPage + 1)
                                    }
                                }
                            },
                            enabled = pagerState.currentPage < filteredIncidents.size - 1
                        ) {
                            Icon(
                                imageVector = Icons.Default.ArrowForward,
                                contentDescription = "Next Record",
                                tint = if (pagerState.currentPage < filteredIncidents.size - 1) Color.White else Color(0xFF334155)
                            )
                        }
                    }
                }
            }
        }
    }

    // Sort & Filter Bottom Sheet / Modal
    if (showFilterSheet) {
        SortAndFilterModal(
            currentSort = sortOrder,
            currentType = selectedTypeFilter,
            filterOb = filterByPoliceOb,
            onApply = { sort, type, ob ->
                sortOrder = sort
                selectedTypeFilter = type
                filterByPoliceOb = ob
                showFilterSheet = false
            },
            onClear = {
                sortOrder = SortOrder.DATE_DESC
                selectedTypeFilter = "All"
                filterByPoliceOb = false
                showFilterSheet = false
            },
            onDismiss = { showFilterSheet = false }
        )
    }

    // Complainant Profile Edit Dialog
    if (showEditProfileDialog) {
        ComplainantProfileDialog(
            existingProfile = userProfile ?: UserProfileEntity(),
            onDismiss = { showEditProfileDialog = false },
            onSave = { updated ->
                onSaveUserProfile(updated)
                showEditProfileDialog = false
            }
        )
    }

    // Digital Signature Pad Dialog
    if (showSignaturePad) {
        SignaturePadDialog(
            onDismiss = { showSignaturePad = false },
            onSignatureCaptured = { signatureBase64 ->
                val current = userProfile ?: UserProfileEntity()
                onSaveUserProfile(current.copy(digitalSignatureBase64 = signatureBase64))
                showSignaturePad = false
            }
        )
    }
}

@Composable
fun ComplainantParticularsBar(
    userProfile: UserProfileEntity?,
    attachDetails: Boolean,
    onToggleAttach: (Boolean) -> Unit,
    onEditProfile: () -> Unit,
    onSign: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF131722)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF262D40))
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(
                        checked = attachDetails,
                        onCheckedChange = onToggleAttach,
                        colors = CheckboxDefaults.colors(
                            checkedColor = SankofaGold,
                            checkmarkColor = Color.Black
                        )
                    )
                    Column {
                        Text(
                            text = "Include Complainant Particulars",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = if (userProfile != null && userProfile.isProfileCompleted)
                                userProfile.fullLegalNames.ifBlank { "Profile active" }
                            else
                                "No profile saved &bull; Tap to add",
                            color = if (userProfile != null && userProfile.isProfileCompleted) Color(0xFF38BDF8) else SafetyAmber,
                            fontSize = 10.sp
                        )
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    OutlinedButton(
                        onClick = onEditProfile,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.height(32.dp)
                    ) {
                        Text(
                            text = if (userProfile != null && userProfile.isProfileCompleted) "Edit" else "Add Info",
                            fontSize = 11.sp,
                            color = SankofaGold
                        )
                    }

                    OutlinedButton(
                        onClick = onSign,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.height(32.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Draw, contentDescription = null, modifier = Modifier.size(12.dp), tint = Color.White)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (userProfile?.digitalSignatureBase64?.isNotBlank() == true) "Signed" else "Sign",
                            fontSize = 11.sp,
                            color = Color.White
                        )
                    }
                }
            }

            if (attachDetails && userProfile != null && userProfile.isAddressWithheld) {
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF221518), RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(imageVector = Icons.Default.Security, contentDescription = null, tint = SafetyRed, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Section 4(2) Safe Address Protected (Residential address withheld)",
                        color = Color(0xFFFCA5A5),
                        fontSize = 10.sp
                    )
                }
            }
        }
    }
}

@Composable
fun SwipeableIncidentDossierCard(
    incident: IncidentEntity,
    pageIndex: Int,
    totalCount: Int
) {
    val severityColor = when (incident.severityLevel) {
        5 -> SafetyRed
        4 -> Color(0xFFEA580C)
        3 -> SafetyAmber
        else -> SafetyGreen
    }

    Card(
        modifier = Modifier
            .fillMaxSize()
            .padding(vertical = 4.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF131722)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF262D40))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(18.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Card Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = Color(0xFF1E293B),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "INCIDENT #${pageIndex + 1} OF $totalCount",
                        color = Color(0xFF94A3B8),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }

                Surface(
                    color = severityColor.copy(alpha = 0.2f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, severityColor.copy(alpha = 0.6f)),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "SEVERITY ${incident.severityLevel} / 5",
                        color = severityColor,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Category & Date
            Text(
                text = incident.incidentType,
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )
            )
            Text(
                text = incident.dateTimeFormatted,
                style = MaterialTheme.typography.bodySmall.copy(
                    color = SankofaGoldLight,
                    fontWeight = FontWeight.Medium
                )
            )

            Divider(color = Color(0xFF262D40), modifier = Modifier.padding(vertical = 12.dp))

            // Key Incident Metadata Rows
            MetadataRow(label = "Alleged Perpetrator", value = incident.perpetrator.ifBlank { "Respondent" })
            MetadataRow(label = "Location", value = incident.locationDescription.ifBlank { "Not specified" })

            if (incident.policeObNumber.isNotBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF0F231D), RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null, tint = SafetyGreen, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Column {
                        Text(text = "SAPS Occurrence Book (OB) Reference", color = SafetyGreen, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        Text(text = incident.policeObNumber, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.ExtraBold)
                    }
                }
            }

            if (incident.injuriesOrImpact.isNotBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                MetadataRow(label = "Injuries / Impact", value = incident.injuriesOrImpact)
            }

            if (incident.witnesses.isNotBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                MetadataRow(label = "Witnesses", value = incident.witnesses)
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Factual Sworn Narrative Box
            Text(
                text = "SWORN FACTUAL STATEMENT",
                color = Color(0xFF94A3B8),
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Surface(
                color = Color(0xFF0A0D14),
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E2638)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = incident.description,
                    color = Color.White,
                    fontSize = 12.sp,
                    lineHeight = 18.sp,
                    modifier = Modifier.padding(14.dp)
                )
            }
        }
    }
}

@Composable
fun MetadataRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, color = Color(0xFF94A3B8), fontSize = 11.sp)
        Text(text = value, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun SortAndFilterModal(
    currentSort: SortOrder,
    currentType: String,
    filterOb: Boolean,
    onApply: (SortOrder, String, Boolean) -> Unit,
    onClear: () -> Unit,
    onDismiss: () -> Unit
) {
    var sort by remember { mutableStateOf(currentSort) }
    var type by remember { mutableStateOf(currentType) }
    var obOnly by remember { mutableStateOf(filterOb) }

    val incidentTypes = listOf("All", "Physical", "Verbal/Emotional", "Threat", "Financial", "Stalking", "Property Damage")

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Sort & Filter Records",
                color = SankofaGold,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Sort Section
                Text(text = "Sort Order", color = Color(0xFF94A3B8), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(
                        onClick = { sort = SortOrder.DATE_DESC },
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = if (sort == SortOrder.DATE_DESC) Color(0xFF1E293B) else Color.Transparent
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Newest", fontSize = 11.sp, color = if (sort == SortOrder.DATE_DESC) SankofaGold else Color.White)
                    }
                    OutlinedButton(
                        onClick = { sort = SortOrder.DATE_ASC },
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = if (sort == SortOrder.DATE_ASC) Color(0xFF1E293B) else Color.Transparent
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Oldest", fontSize = 11.sp, color = if (sort == SortOrder.DATE_ASC) SankofaGold else Color.White)
                    }
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(
                        onClick = { sort = SortOrder.SEVERITY_DESC },
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = if (sort == SortOrder.SEVERITY_DESC) Color(0xFF1E293B) else Color.Transparent
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Severity (High)", fontSize = 11.sp, color = if (sort == SortOrder.SEVERITY_DESC) SafetyRed else Color.White)
                    }
                    OutlinedButton(
                        onClick = { sort = SortOrder.SEVERITY_ASC },
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = if (sort == SortOrder.SEVERITY_ASC) Color(0xFF1E293B) else Color.Transparent
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Severity (Low)", fontSize = 11.sp, color = if (sort == SortOrder.SEVERITY_ASC) SafetyGreen else Color.White)
                    }
                }

                Divider(color = Color(0xFF262D40))

                // Filter by Type
                Text(text = "Filter by Abuse Category", color = Color(0xFF94A3B8), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    incidentTypes.forEach { t ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { type = t }
                                .padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = if (type == t) Icons.Default.CheckCircle else Icons.Default.Close,
                                contentDescription = null,
                                tint = if (type == t) SankofaGold else Color(0xFF475569),
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = t, color = if (type == t) Color.White else Color(0xFF94A3B8), fontSize = 12.sp)
                        }
                    }
                }

                Divider(color = Color(0xFF262D40))

                // Filter by Police OB
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { obOnly = !obOnly },
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = obOnly,
                        onCheckedChange = { obOnly = it },
                        colors = CheckboxDefaults.colors(checkedColor = SafetyGreen)
                    )
                    Text("Only show incidents with SAPS OB #", color = Color.White, fontSize = 12.sp)
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onApply(sort, type, obOnly) },
                colors = ButtonDefaults.buttonColors(containerColor = SankofaGold)
            ) {
                Text("Apply Filters", color = Color(0xFF141006), fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onClear) {
                Text("Clear All", color = TextSecondary)
            }
        },
        containerColor = SankofaSurface
    )
}

@Composable
fun ComplainantProfileDialog(
    existingProfile: UserProfileEntity,
    onDismiss: () -> Unit,
    onSave: (UserProfileEntity) -> Unit
) {
    var fullLegalNames by remember { mutableStateOf(existingProfile.fullLegalNames) }
    var idNumber by remember { mutableStateOf(existingProfile.idOrPassportNumber) }
    var contactNumber by remember { mutableStateOf(existingProfile.safeContactNumber) }
    var serviceAddress by remember { mutableStateOf(existingProfile.safeServiceAddress) }
    var isAddressWithheld by remember { mutableStateOf(existingProfile.isAddressWithheld) }
    var relationship by remember { mutableStateOf(existingProfile.relationshipToRespondent) }
    var respondentName by remember { mutableStateOf(existingProfile.respondentName) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Complainant Legal Particulars (Form 2)",
                color = SankofaGold,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "Statutory particulars required by the Clerk of the Court for Domestic Violence Act Protection Order applications:",
                    color = TextSecondary,
                    fontSize = 11.sp
                )

                OutlinedTextField(
                    value = fullLegalNames,
                    onValueChange = { fullLegalNames = it },
                    label = { Text("Complainant Full Legal Names") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = idNumber,
                    onValueChange = { idNumber = it },
                    label = { Text("South African ID or Passport Number") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = contactNumber,
                    onValueChange = { contactNumber = it },
                    label = { Text("Safe Contact Telephone Number") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = respondentName,
                    onValueChange = { respondentName = it },
                    label = { Text("Respondent / Abuser Full Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = relationship,
                    onValueChange = { relationship = it },
                    label = { Text("Domestic Relationship (e.g. Spouse, Ex-partner)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                // Safe Address Withholding Checkbox
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF1E293B), RoundedCornerShape(8.dp))
                        .padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = isAddressWithheld,
                        onCheckedChange = { isAddressWithheld = it },
                        colors = CheckboxDefaults.colors(checkedColor = SafetyRed)
                    )
                    Column {
                        Text(
                            text = "Withhold Residential Address (Section 4(2))",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Check this if disclosure to respondent risks your physical safety.",
                            color = Color(0xFF94A3B8),
                            fontSize = 9.sp
                        )
                    }
                }

                OutlinedTextField(
                    value = serviceAddress,
                    onValueChange = { serviceAddress = it },
                    label = {
                        Text(if (isAddressWithheld) "Alternative Safe Service Address / Police Station" else "Address for Service of Notices")
                    },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSave(
                        existingProfile.copy(
                            fullLegalNames = fullLegalNames,
                            idOrPassportNumber = idNumber,
                            safeContactNumber = contactNumber,
                            safeServiceAddress = serviceAddress,
                            isAddressWithheld = isAddressWithheld,
                            relationshipToRespondent = relationship,
                            respondentName = respondentName,
                            isProfileCompleted = fullLegalNames.isNotBlank()
                        )
                    )
                },
                enabled = fullLegalNames.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = SankofaGold)
            ) {
                Text("Save Particulars", color = Color(0xFF141006), fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = TextSecondary)
            }
        },
        containerColor = SankofaSurface
    )
}
