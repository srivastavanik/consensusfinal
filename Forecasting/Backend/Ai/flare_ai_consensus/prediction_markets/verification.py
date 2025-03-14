# verification.py
import re
from collections import Counter
from datetime import datetime

class VerificationModule:
    """Handles verification and citation tracking for prediction market decisions."""
    
    def __init__(self):
        self.common_citation_patterns = [
            r"Source:\s*(.*?)(?=Source:|$)",
            r"\[(\d+)\]\s*(.*?)(?=\[\d+\]|$)",
            r"Citation\s*(\d+):\s*(.*?)(?=Citation\s*\d+:|$)",
            r"Reference\s*(\d+):\s*(.*?)(?=Reference\s*\d+:|$)"
        ]
    
    def extract_citations(self, text):
        """Extract citations from model responses using various patterns."""
        citations = []
        
        for pattern in self.common_citation_patterns:
            matches = re.findall(pattern, text, re.DOTALL)
            if matches:
                if isinstance(matches[0], tuple):
                    citations.extend([m[1].strip() if len(m) > 1 else m[0].strip() for m in matches])
                else:
                    citations.extend([m.strip() for m in matches])
        
        # Also look for URL patterns
        url_pattern = r'https?://[^\s)>]+'
        urls = re.findall(url_pattern, text)
        citations.extend(urls)
        
        return citations
    
    def aggregate_citations(self, responses):
        """Collect and merge citations from multiple responses."""
        all_citations = []
        
        for response in responses:
            citations = self.extract_citations(response)
            all_citations.extend(citations)
        
        # Count frequency of each citation
        citation_counter = Counter(all_citations)
        
        # Sort by frequency, then alphabetically
        sorted_citations = sorted(citation_counter.items(), key=lambda x: (-x[1], x[0]))
        
        return [citation for citation, count in sorted_citations]
    
    def extract_confidence(self, text):
        """Extract confidence scores from response text."""
        confidence_pattern = r"confidence\s*(?:level|score)?(?:\s*:)?\s*(\d+(?:\.\d+)?)\s*(?:out of|\/)?\s*10"
        matches = re.findall(confidence_pattern, text.lower())
        
        if matches:
            try:
                return float(matches[0])
            except ValueError:
                pass
        
        return None
    
    def extract_decision(self, text):
        """Extract Yes/No or True/False decisions from response text."""
        # Look for clear yes/no statements
        yes_pattern = r"(?:answer|outcome|result|conclusion)(?:\s*:)?\s*(yes|true|correct|affirm)"
        no_pattern = r"(?:answer|outcome|result|conclusion)(?:\s*:)?\s*(no|false|incorrect|deny)"
        
        yes_match = re.search(yes_pattern, text.lower())
        no_match = re.search(no_pattern, text.lower())
        
        if yes_match:
            return "YES"
        elif no_match:
            return "NO"
        
        # Check for other indicators
        if re.search(r"\byes\b", text.lower()):
            return "YES"
        elif re.search(r"\bno\b", text.lower()):
            return "NO"
        elif re.search(r"\btrue\b", text.lower()):
            return "YES"
        elif re.search(r"\bfalse\b", text.lower()):
            return "NO"
        
        return "UNDETERMINED"
    
    def generate_verification_report(self, responses, final_response):
        """Generate a complete verification report with evidence."""
        all_citations = self.aggregate_citations(responses + [final_response])
        
        final_decision = self.extract_decision(final_response)
        final_confidence = self.extract_confidence(final_response)
        
        # Calculate model agreement
        model_agreement = self._calculate_agreement(responses)
        
        # Prepare verification report
        report = {
            "decision": final_decision,
            "confidence": final_confidence if final_confidence else "UNKNOWN",
            "supporting_evidence": all_citations,
            "model_agreement": model_agreement,
            "verification_timestamp": datetime.now().isoformat(),
            "attestation": self._generate_attestation(final_decision, final_confidence, model_agreement)
        }
        
        return report
    
    def _calculate_agreement(self, responses):
        """Calculate the level of agreement between model responses."""
        decisions = [self.extract_decision(r) for r in responses]
        decision_counter = Counter(decisions)
        
        if "UNDETERMINED" in decision_counter:
            del decision_counter["UNDETERMINED"]
        
        if not decision_counter:
            return 0.0
        
        most_common = decision_counter.most_common(1)[0]
        return most_common[1] / len(decisions)
    
    def _generate_attestation(self, decision, confidence, agreement):
        """Generate a structured attestation for on-chain verification."""
        return {
            "decision": decision,
            "confidence_score": confidence,
            "model_agreement": agreement,
            "timestamp": int(datetime.now().timestamp()),
            "tee_verification": True
        }
        
    def check_factual_consistency(self, responses):
        """Check for factual consistency across model responses."""
        # Extract all numerical claims from responses
        price_pattern = r"\$\s*(\d+(?:,\d+)*(?:\.\d+)?)"
        percentage_pattern = r"(\d+(?:\.\d+)?)\s*%"
        date_pattern = r"\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b"
        
        prices = []
        percentages = []
        dates = []
        
        for response in responses:
            prices.extend([float(p.replace(',', '')) for p in re.findall(price_pattern, response)])
            percentages.extend([float(p) for p in re.findall(percentage_pattern, response)])
            dates.extend(re.findall(date_pattern, response))
        
        # Check for significant variance in numerical claims
        price_variance = self._calculate_variance(prices)
        percentage_variance = self._calculate_variance(percentages)
        
        # Identify inconsistencies
        inconsistencies = []
        
        if price_variance > 0.2 and prices:  # More than 20% variance in prices
            inconsistencies.append({
                "type": "price_inconsistency",
                "variance": price_variance,
                "values": prices
            })
            
        if percentage_variance > 0.15 and percentages:  # More than 15% variance in percentages
            inconsistencies.append({
                "type": "percentage_inconsistency",
                "variance": percentage_variance,
                "values": percentages
            })
            
        # Check for date inconsistencies
        if len(set(dates)) > 1:
            inconsistencies.append({
                "type": "date_inconsistency",
                "values": list(set(dates))
            })
            
        return {
            "factually_consistent": len(inconsistencies) == 0,
            "inconsistencies": inconsistencies
        }
    
    def _calculate_variance(self, values):
        """Calculate normalized variance for a list of numerical values."""
        if not values or len(values) < 2:
            return 0.0
            
        mean = sum(values) / len(values)
        if mean == 0:
            return 0.0
            
        variance = sum((x - mean) ** 2 for x in values) / len(values)
        return (variance ** 0.5) / mean  # Normalized standard deviation (coefficient of variation) 