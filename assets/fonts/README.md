# Official local fonts

Original Fontsource 5.3.0 WOFF2 files and OFL licenses are preserved.
Source: https://github.com/fontsource/fontsource

Defaults: original Manrope for body/navigation, Cormorant for headings,
official Noto Sans for eyebrow/category labels. Original Manrope and Cormorant
font-face rules are preserved. No modified glyph outlines are used.

Manrope lacks U+018F (capital schwa). The experimental Manrope AZ file is
removed. Selecting Manrope for eyebrow uses Noto Sans for the entire label,
so words do not mix font designs. Other roles retain original Manrope.

Actual WOFF2 cmap/fvar tables were inspected with FontTools 4.66.0. All other
families cover Azerbaijani letters with Latin + Latin Extended subsets.
The verified manifest records hashes, weight ranges and Manrope's exception.
Only selected families are copied; there are no runtime Google Fonts requests.
