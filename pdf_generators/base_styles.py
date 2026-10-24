import os
from reportlab.lib.pagesizes import A4, letter, landscape
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

# Palette
DARK_BG = colors.HexColor("#0A0B10")
SURFACE_DARK = colors.HexColor("#12141D")
SURFACE_ELEVATED = colors.HexColor("#1B1E2B")
GOLD = colors.HexColor("#D4AF37")
GOLD_LIGHT = colors.HexColor("#F3E5AB")
ALERT_RED = colors.HexColor("#E63946")
ALERT_RED_LIGHT = colors.HexColor("#FFCCD0")
SAFE_GREEN = colors.HexColor("#2A9D8F")
SAFE_GREEN_LIGHT = colors.HexColor("#D1F2EB")
TEXT_PRIMARY = colors.HexColor("#0F172A")
TEXT_SECONDARY = colors.HexColor("#334155")
TEXT_MUTED = colors.HexColor("#64748B")
LIGHT_BG = colors.HexColor("#F8FAFC")
BORDER_COLOR = colors.HexColor("#CBD5E1")
WHITE = colors.white

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw total page count
    along with running header and running footer.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        self.saveState()
        page_w, page_h = self._pagesize

        # Running Header (pages > 1)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(GOLD)
            self.drawString(54, page_h - 36, "UMKHUSELI: THE PROTECTOR (SANKOFA SAFE)")
            
            self.setFont("Helvetica", 8)
            self.setFillColor(TEXT_MUTED)
            header_title = getattr(self, "doc_title", "Technical Architecture & Requirements")
            self.drawRightString(page_w - 54, page_h - 36, header_title.upper())

            # Thin divider rule
            self.setStrokeColor(BORDER_COLOR)
            self.setLineWidth(0.6)
            self.line(54, page_h - 42, page_w - 54, page_h - 42)

        # Running Footer (all pages)
        self.setStrokeColor(BORDER_COLOR)
        self.setLineWidth(0.6)
        self.line(54, 46, page_w - 54, 46)

        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(TEXT_SECONDARY)
        self.drawString(54, 32, "Confidential & Proprietary • South African GBV Emergency Response System (POPIA & DVA Compliant)")

        self.setFont("Helvetica", 7.5)
        self.setFillColor(TEXT_MUTED)
        self.drawRightString(page_w - 54, 32, f"Page {self._pageNumber} of {total_pages}")

        self.restoreState()


class PresentationCanvas(canvas.Canvas):
    """
    Landscape presentation canvas with dark sleek styling.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_slide_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_slide_decorations(self, total_pages):
        self.saveState()
        page_w, page_h = self._pagesize

        # Running header on slides
        self.setFont("Helvetica-Bold", 9)
        self.setFillColor(GOLD)
        self.drawString(40, page_h - 28, "UMKHUSELI: THE PROTECTOR")
        
        self.setFont("Helvetica", 8.5)
        self.setFillColor(colors.HexColor("#9CA3AF"))
        self.drawString(215, page_h - 28, "•   Executive Presentation Deck")

        self.setStrokeColor(colors.HexColor("#2D3142"))
        self.setLineWidth(0.8)
        self.line(40, page_h - 35, page_w - 40, page_h - 35)

        # Footer
        self.line(40, 32, page_w - 40, 32)
        self.setFont("Helvetica", 8)
        self.drawString(40, 20, "Sankofa Safe • Dual-Persona Covert GBV Response Platform • South Africa")
        self.drawRightString(page_w - 40, 20, f"Slide {self._pageNumber} of {total_pages}")

        self.restoreState()


def get_custom_styles():
    base = getSampleStyleSheet()

    styles = {
        'DocTitle': ParagraphStyle(
            'DocTitle',
            parent=base['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            leading=28,
            textColor=TEXT_PRIMARY,
            spaceAfter=6
        ),
        'DocSubtitle': ParagraphStyle(
            'DocSubtitle',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=11,
            leading=16,
            textColor=TEXT_SECONDARY,
            spaceAfter=15
        ),
        'Badge': ParagraphStyle(
            'Badge',
            parent=base['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=GOLD,
            spaceAfter=6
        ),
        'H1': ParagraphStyle(
            'H1',
            parent=base['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=15,
            leading=19,
            textColor=TEXT_PRIMARY,
            spaceBefore=14,
            spaceAfter=8,
            keepWithNext=True
        ),
        'H2': ParagraphStyle(
            'H2',
            parent=base['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=GOLD,
            spaceBefore=10,
            spaceAfter=4,
            keepWithNext=True
        ),
        'H3': ParagraphStyle(
            'H3',
            parent=base['Heading3'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=14,
            textColor=TEXT_PRIMARY,
            spaceBefore=8,
            spaceAfter=4,
            keepWithNext=True
        ),
        'Body': ParagraphStyle(
            'Body',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13.5,
            textColor=TEXT_SECONDARY,
            spaceAfter=6
        ),
        'BodyBold': ParagraphStyle(
            'BodyBold',
            parent=base['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=13.5,
            textColor=TEXT_PRIMARY,
            spaceAfter=6
        ),
        'Bullet': ParagraphStyle(
            'Bullet',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=12.5,
            textColor=TEXT_SECONDARY,
            leftIndent=14,
            firstLineIndent=-10,
            spaceAfter=3
        ),
        'CalloutText': ParagraphStyle(
            'CalloutText',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=12.5,
            textColor=TEXT_PRIMARY
        ),
        'TableText': ParagraphStyle(
            'TableText',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=11,
            textColor=TEXT_SECONDARY
        ),
        'TableTextBold': ParagraphStyle(
            'TableTextBold',
            parent=base['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=11,
            textColor=TEXT_PRIMARY
        ),
        'TableHeader': ParagraphStyle(
            'TableHeader',
            parent=base['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=11,
            textColor=WHITE
        )
    }
    return styles

def make_callout(text, title=None, style_type='gold', width=487):
    styles = get_custom_styles()
    border_c = GOLD
    bg_c = colors.HexColor("#FEFCE8")
    title_c = colors.HexColor("#854D0E")

    if style_type == 'red':
        border_c = ALERT_RED
        bg_c = colors.HexColor("#FEF2F2")
        title_c = colors.HexColor("#991B1B")
    elif style_type == 'green':
        border_c = SAFE_GREEN
        bg_c = colors.HexColor("#ECFDF5")
        title_c = colors.HexColor("#065F46")
    elif style_type == 'navy':
        border_c = SURFACE_ELEVATED
        bg_c = colors.HexColor("#F1F5F9")
        title_c = colors.HexColor("#1E293B")

    content = []
    if title:
        content.append(Paragraph(f"<b>{title.upper()}</b>", ParagraphStyle(
            'CalloutTitle', parent=styles['BodyBold'], textColor=title_c, fontSize=8.5, spaceAfter=2
        )))
    content.append(Paragraph(text, styles['CalloutText']))

    t = Table([[content]], colWidths=[width])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_c),
        ('BOX', (0,0), (-1,-1), 0.5, border_c),
        ('LINELEFT', (0,0), (0,0), 3.5, border_c),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    return t
