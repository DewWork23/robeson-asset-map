'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Organization, CATEGORY_COLORS, CATEGORY_ICONS } from '@/types/organization';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { categoryToSlug } from '@/utils/categoryUtils';
import FeedbackBanner from '@/components/FeedbackBanner';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { organizations, loading } = useOrganizations();
  const [searchResults, setSearchResults] = useState<Organization[]>([]);
  const [directMatchIds, setDirectMatchIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);
  const [showEmergencyWarning, setShowEmergencyWarning] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    const fromVoice = searchParams.get('from') === 'voice';
    
    setSearchQuery(query);
    setIsVoiceSearch(fromVoice);

    if (query && organizations.length > 0) {
      // Search organizations by name, services, and description
      let normalizedQuery = query.toLowerCase().trim();
      
      // Check for organization acronyms/aliases
      const organizationAliases: { [key: string]: string } = {
        'rhcc': 'robeson health care corporation',
        'r h c c': 'robeson health care corporation',
        'r.h.c.c': 'robeson health care corporation',
        'r.h.c.c.': 'robeson health care corporation'
      };
      
      // Replace alias with full name if found
      if (organizationAliases[normalizedQuery]) {
        normalizedQuery = organizationAliases[normalizedQuery];
      }
      
      // Check for emergency/danger keywords
      const emergencyKeywords = [
        'suicide', 'suicidal', 'kill myself', 'want to die', 'end my life', 
        'end it all', 'dying', 'die', 'death', 'dead', 'hopeless', 
        'worthless', 'give up', "don't want to live", 'dont want to live',
        'no reason to live', 'feel like dying', 'i feel like dying',
        'kill me', 'kill', 'murder', 'hurt myself', 'harm myself',
        'self harm', 'self-harm', 'cut myself', 'cutting',
        'overdose', 'od', 'pills to die', 'jump off',
        'hang myself', 'hanging', 'shoot myself', 'gun'
      ];
      
      const hasEmergencyKeyword = emergencyKeywords.some(keyword => 
        normalizedQuery.includes(keyword)
      );
      
      setShowEmergencyWarning(hasEmergencyKeyword);
      
      // Define category keywords mapping
      const categoryKeywords: Record<string, string[]> = {
        'Crisis Services': ['crisis', 'emergency', 'help', '911', 'suicide', 'danger', 'urgent', 'immediate', 'depressed', 'suicidal', 'kill myself', 'want to die', 'need help now', 'anxious', 'panic', 'panic attack', 'scared', 'overwhelmed', 'dying', 'feel like dying', 'i feel like dying', 'end my life', 'end it all', 'hopeless', 'no hope', 'worthless', 'give up', 'dont want to live', "don't want to live", 'death', 'dead'],
        'Food Services': ['food', 'hungry', 'meal', 'eat', 'pantry', 'breakfast', 'lunch', 'dinner', 'nutrition', 'groceries', "i'm hungry", 'starving'],
        'Housing Services': ['housing', 'shelter', 'home', 'homeless', 'rent', 'apartment', 'eviction', 'utilities', "i'm homeless", 'place to stay', 'nowhere to go'],
        'Healthcare Services': ['health', 'doctor', 'medical', 'hospital', 'clinic', 'sick', 'pain', 'nurse', 'urgent care', "i'm sick", 'hurt', 'injured', 'healthcare', 'physician'],
        'Healthcare/Medical': ['health', 'doctor', 'medical', 'hospital', 'clinic', 'sick', 'pain', 'nurse', 'urgent care', "i'm sick", 'hurt', 'injured', 'healthcare', 'physician'],
        'Healthcare/Treatment': ['health', 'doctor', 'medical', 'treatment', 'therapy', 'clinic', 'care'],
        'Healthcare/Public Health': ['health', 'doctor', 'medical', 'public health', 'wellness', 'prevention'],
        'Mental Health': ['mental', 'counseling', 'therapy', 'psychology', 'psychiatry', 'behavioral'],
        'Mental Health & Substance Use': ['mental', 'counseling', 'therapy', 'addiction', 'substance', 'depression', 'depressed', 'anxiety', 'anxious', 'sad', 'worried', 'stress', 'stressed', 'drugs', 'alcohol', 'recovery', "i'm depressed", "im depressed", "i am depressed", "feeling depressed", "i'm sad", "im sad", "i'm anxious", "im anxious", "i'm stressed", "im stressed", "feel depressed", "feeling sad", "feeling anxious", "feeling stressed", "need help", "suicide", "suicidal", "kill myself", "want to die", "i'm feeling anxious", "i am anxious", "panic", "panic attack", "scared", "i'm scared", "fearful", "overwhelmed", "i'm overwhelmed", "feel like dying", "i feel like dying", "hopeless", "i feel hopeless", "worthless", "i feel worthless", "no reason to live", "end my life", "end it all", "give up", "don't want to live", "dont want to live", 'bipolar', 'ptsd', 'ocd', 'adhd', 'schizophrenia', 'psychosis', 'trauma', 'grief', 'bereavement', 'mood disorder', 'personality disorder'],
        'Government Services': ['government', 'benefits', 'assistance', 'social services', 'welfare', 'medicaid', 'medicare', 'snap'],
        'Tribal Services': ['tribal', 'lumbee', 'native', 'indian', 'indigenous'],
        'Community Services': ['community', 'support', 'volunteer', 'help', 'services', 'pawss', 'paws'],
        'Community Groups & Development': ['group', 'development', 'organization', 'nonprofit', 'charity'],
        'Faith-Based Services': ['faith', 'church', 'religious', 'prayer', 'spiritual', 'ministry', 'worship', 'god'],
        'Legal Services': ['legal', 'lawyer', 'attorney', 'court', 'justice', 'rights', 'lawsuit', 'divorce'],
        'Law Enforcement': ['police', 'sheriff', 'law', 'crime', 'safety', 'report', 'officer'],
        'Education': ['education', 'school', 'learning', 'library', 'study', 'class', 'training', 'ged', 'college'],
        'Pharmacy': ['pharmacy', 'medicine', 'prescription', 'drug', 'medication', 'pills', 'rx'],
        'Cultural & Information Services': ['cultural', 'information', 'culture', 'arts', 'museum', 'history', 'heritage']
      };
      
      // First, check if query matches any category keywords
      let matchedCategories: string[] = [];
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        const hasMatch = keywords.some(keyword => {
          // Exact match or query contains keyword
          if (normalizedQuery.includes(keyword)) return true;
          
          // Keyword contains query (for single words)
          if (keyword.includes(normalizedQuery) && normalizedQuery.split(' ').length === 1) return true;
          
          // Special handling for mental health phrases
          if (category === 'Mental Health & Substance Use' || category === 'Crisis Services') {
            // Check for key mental health terms within the query
            const mentalHealthTerms = ['depressed', 'sad', 'anxious', 'stressed', 'worried', 'anxiety', 'depression', 'mental', 'suicide', 'help', 'panic', 'scared', 'fear', 'overwhelmed', 'dying', 'die', 'dead', 'death', 'hopeless', 'worthless', 'end it', 'give up'];
            return mentalHealthTerms.some(term => normalizedQuery.includes(term));
          }
          
          return false;
        });
        
        if (hasMatch) {
          matchedCategories.push(category);
        }
      }
      
      // Helper function for fuzzy matching - only for specific known variations
      const fuzzyMatch = (str1: string, str2: string): boolean => {
        const clean1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
        const clean2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Only match specific known variations, not partial matches
        const soundsLike: Record<string, string[]> = {
          'pause': ['pawss', 'paws'],
          'pawss': ['pause', 'paws', 'pauls', "paul's"],
          'paws': ['pause', 'pawss', 'pauls', "paul's"],
          'pauls': ['pawss', 'paws'],
          "paul's": ['pawss', 'paws'],
        };
        
        // Check if the search term matches any known variations
        return soundsLike[clean2]?.some(variant => clean1.includes(variant)) || false;
      };
      
      // Find direct matches in organization names, services, and descriptions
      const directMatches = organizations.filter(org => {
        const orgName = org.organizationName.toLowerCase();
        const searchableText = `${org.organizationName} ${org.servicesOffered || ''} ${org.description || ''}`.toLowerCase();
        
        // Special handling for known organizations
        if (normalizedQuery === 'pause' && orgName.includes('pawss')) {
          console.log('Found PAWSS for pause query');
          return true;
        }
        if ((normalizedQuery === 'pauls' || normalizedQuery === "paul's") && orgName.includes('pawss')) {
          console.log('Found PAWSS for pauls/paul\'s query');
          return true;
        }
        
        // For short queries, only match whole words to avoid false positives
        let textMatch = false;
        
        // Always use word boundary matching for single-word queries to avoid partial matches
        const isSingleWord = !normalizedQuery.includes(' ');
        
        if (isSingleWord && normalizedQuery.length <= 10) {
          // For single words like "pause" or "doctor", match whole words only
          const wordBoundaryRegex = new RegExp(`\\b${normalizedQuery}\\b`, 'i');
          textMatch = wordBoundaryRegex.test(orgName) || 
                     wordBoundaryRegex.test(searchableText) ||
                     fuzzyMatch(orgName, normalizedQuery);
        } else {
          // For longer queries or phrases, use contains matching
          textMatch = orgName.includes(normalizedQuery) || 
                     searchableText.includes(normalizedQuery);
        }
        
        // Only return true if we have an actual text match
        return textMatch;
      });

      let allResults = [...directMatches];
      
      // Check if this is a specific mental health condition search
      const mentalHealthConditions = ['bipolar', 'anxiety', 'depression', 'ptsd', 'ocd', 'adhd', 'schizophrenia', 'psychosis', 'trauma', 'grief', 'panic', 'mood disorder', 'personality disorder'];
      const isSpecificCondition = mentalHealthConditions.some(condition => normalizedQuery.includes(condition));
      
      // Check if this is a substance use search
      const substanceUseTerms = ['addiction', 'substance', 'alcohol', 'drug', 'drugs', 'alcoholic', 'alcoholism', 'narcotic', 'cocaine', 'meth', 'heroin', 'opioid', 'opiate', 'recovery', 'rehab', 'detox', 'sober', 'sobriety'];
      const isSubstanceUseSearch = substanceUseTerms.some(term => normalizedQuery.includes(term));
      
      // Debug logging for mental health condition searches
      if (isSpecificCondition) {
        console.log(`Mental health condition search detected for: "${normalizedQuery}"`);
        console.log('Matched categories:', matchedCategories);
        console.log('Direct matches found:', directMatches.length);
        console.log('Is specific condition:', isSpecificCondition);
      }
      
      // If we have category keyword matches, always include them
      // This ensures searches like "doctor" show healthcare organizations
      if (matchedCategories.length > 0 && !isSpecificCondition) {
        // Include organizations from matched categories
        const categoryMatches = organizations.filter(org => {
          // For mental health specific conditions, be more selective
          const mentalHealthConditions = ['bipolar', 'anxiety', 'depression', 'ptsd', 'ocd', 'adhd', 'schizophrenia', 'psychosis', 'trauma', 'grief', 'panic', 'mood disorder', 'personality disorder'];
          const isSpecificCondition = mentalHealthConditions.some(condition => normalizedQuery.includes(condition));
          
          if (isSpecificCondition && matchedCategories.includes('Mental Health & Substance Use')) {
            // For mental health condition searches, include ALL mental health & substance use organizations
            // This ensures people searching for "anxiety" or "depression" see all available resources
            // including integrated care facilities that handle both mental health and substance use
            return org.category === 'Mental Health & Substance Use';
          }
          
          // Check if organization is in a matched category
          if (matchedCategories.includes(org.category)) return true;
          
          // Also check for healthcare organizations that might be miscategorized
          // (e.g., hospitals categorized as "Crisis Services")
          if (normalizedQuery === 'doctor' || normalizedQuery === 'medical' || normalizedQuery === 'healthcare' || normalizedQuery === 'physician') {
            const servicesText = (org.servicesOffered || '').toLowerCase();
            const descText = (org.description || '').toLowerCase();
            const orgName = org.organizationName.toLowerCase();
            
            // More specific medical provider detection
            const isMedicalProvider = 
              // Direct medical facilities
              orgName.includes('hospital') ||
              orgName.includes('clinic') ||
              orgName.includes('health center') ||
              orgName.includes('medical') ||
              orgName.includes('physician') ||
              orgName.includes('doctor') ||
              orgName.includes('practice') ||
              // Service descriptions
              servicesText.includes('primary care') ||
              servicesText.includes('medical care') ||
              servicesText.includes('medical services') ||
              servicesText.includes('acute care') ||
              servicesText.includes('urgent care') ||
              servicesText.includes('emergency care') ||
              servicesText.includes('physician') ||
              servicesText.includes('diagnosis') ||
              servicesText.includes('treatment') && servicesText.includes('medical') ||
              descText.includes('healthcare system') ||
              descText.includes('medical services') ||
              descText.includes('hospital');
            
            return isMedicalProvider;
          }
          
          return false;
        });
        
        // Combine direct matches with category matches, removing duplicates
        const allMatchIds = new Set([...directMatches.map(o => o.id), ...categoryMatches.map(o => o.id)]);
        allResults = organizations.filter(org => allMatchIds.has(org.id));
        
        // Ensure direct matches are tracked for sorting
        setDirectMatchIds(new Set(directMatches.map(org => org.id)));
        
        console.log(`Search for "${normalizedQuery}" found ${directMatches.length} direct matches and ${categoryMatches.length} category matches`);
      } else if (isSpecificCondition || isSubstanceUseSearch || directMatches.length > 0) {
        // For searches with actual text matches, show similar organizations
        const matchedCats = [...new Set(directMatches.map(org => org.category))];
        
        // Find similar organizations in the same categories
        const similarOrgs = organizations.filter(org => {
          // Don't include if already in direct matches
          if (directMatches.some(match => match.id === org.id)) return false;
          
          // For mental health condition searches, show mental health providers (but not pure substance abuse)
          if (isSpecificCondition && !isSubstanceUseSearch) {
            // Include all organizations in the Mental Health & Substance Use category
            if (org.category === 'Mental Health & Substance Use') return true;
            
            // Also include organizations from other categories that offer mental health services
            const servicesText = (org.servicesOffered || '').toLowerCase();
            const descText = (org.description || '').toLowerCase();
            const orgName = org.organizationName.toLowerCase();
            
            // Check if the organization offers mental health services
            const hasMentalHealthServices = 
              servicesText.includes('mental health') ||
              servicesText.includes('counseling') ||
              servicesText.includes('therapy') ||
              servicesText.includes('psychiatric') ||
              servicesText.includes('depression') ||
              servicesText.includes('anxiety') ||
              servicesText.includes('bipolar') ||
              servicesText.includes('ptsd') ||
              servicesText.includes('mood disorder') ||
              servicesText.includes('behavioral health') ||
              servicesText.includes('psychological') ||
              servicesText.includes('psychotherapy') ||
              servicesText.includes('peer support') ||
              servicesText.includes('support group') ||
              descText.includes('mental health') ||
              descText.includes('behavioral health') ||
              descText.includes('counseling') ||
              descText.includes('therapy') ||
              orgName.includes('counseling') ||
              orgName.includes('therapy') ||
              orgName.includes('mental health') ||
              orgName.includes('behavioral') ||
              orgName.includes('nami') || // National Alliance on Mental Illness
              orgName.includes('depression') ||
              orgName.includes('anxiety');
            
            // Exclude organizations that are primarily substance abuse focused (unless the search is for substance use)
            const isSubstanceAbuseFocused = 
              orgName.includes('anonymous') ||
              orgName.includes(' aa') ||
              orgName.includes('narcotics') ||
              orgName.includes('cocaine') ||
              orgName.includes('crystal meth') ||
              orgName.includes('smart recovery') ||
              orgName.includes('refuge recovery') ||
              orgName.includes('lifering') ||
              orgName.includes('gamblers') ||
              orgName.includes('gam-anon') ||
              orgName.includes('overeaters') ||
              orgName.includes('sex addicts') ||
              orgName.includes('nicotine') ||
              orgName.includes('workaholics') ||
              orgName.includes('harm reduction coalition') ||
              orgName.includes('treatment center') ||
              orgName.includes('methadone') ||
              orgName.includes('suboxone') ||
              orgName.includes('buprenorphine') ||
              orgName.includes('addiction medicine') ||
              (servicesText.includes('12-step') && !servicesText.includes('mental health')) ||
              (servicesText.includes('addiction recovery') && !servicesText.includes('mental health')) ||
              (servicesText.includes('syringe exchange') && !servicesText.includes('mental health')) ||
              (servicesText.includes('methadone') && !servicesText.includes('mental health')) ||
              (servicesText.includes('suboxone') && !servicesText.includes('mental health')) ||
              (servicesText.includes('substance abuse') && !servicesText.includes('mental health') && !servicesText.includes('counseling') && !servicesText.includes('therapy') && !servicesText.includes('depression') && !servicesText.includes('anxiety') && !servicesText.includes('bipolar'));
            
            // Exclude general healthcare that happens to mention mental health in passing
            const isGeneralHealthcare = 
              (orgName.includes('hospital') || orgName.includes('health center') || orgName.includes('medical center')) &&
              !servicesText.includes('psychiatric') &&
              !servicesText.includes('behavioral health') &&
              !servicesText.includes('mental health treatment');
            
            // Include if it's from Crisis Services or Community Services and offers mental health services
            // BUT exclude if it's primarily substance abuse focused or general healthcare
            if ((org.category === 'Crisis Services' || org.category === 'Community Services' || org.category === 'Healthcare Services') && 
                hasMentalHealthServices && 
                !isSubstanceAbuseFocused && 
                !isGeneralHealthcare) {
              return true;
            }
            
            return false;
          }
          
          // For substance use searches, show substance abuse organizations
          if (isSubstanceUseSearch) {
            const servicesText = (org.servicesOffered || '').toLowerCase();
            const orgName = org.organizationName.toLowerCase();
            
            const hasSubstanceServices = 
              servicesText.includes('substance') ||
              servicesText.includes('addiction') ||
              servicesText.includes('recovery') ||
              servicesText.includes('12-step') ||
              servicesText.includes('alcohol') ||
              servicesText.includes('drug') ||
              servicesText.includes('detox') ||
              servicesText.includes('rehab') ||
              servicesText.includes('sober') ||
              orgName.includes('anonymous') ||
              orgName.includes('recovery');
              
            if (hasSubstanceServices) return true;
          }
          
          // For other searches, include if in same category
          return matchedCats.includes(org.category);
        });
        
        // Debug logging for mental health searches
        if (isSpecificCondition) {
          const mentalHealthOrgs = organizations.filter(org => org.category === 'Mental Health & Substance Use');
          console.log('Total Mental Health & Substance Use orgs in database:', mentalHealthOrgs.length);
          console.log('Similar orgs found (including cross-category mental health services):', similarOrgs.length);
          console.log('Sample of similar orgs:', similarOrgs.slice(0, 5).map(o => ({ 
            name: o.organizationName, 
            category: o.category,
            services: (o.servicesOffered || '').substring(0, 50) + '...'
          })));
        }
        
        // Add similar organizations - more for mental health and substance use searches
        const similarLimit = (isSpecificCondition || isSubstanceUseSearch) ? 10 : 10;
        allResults = [...directMatches, ...similarOrgs.slice(0, similarLimit)];
        
        // More debug logging
        if (isSpecificCondition) {
          console.log('Final allResults length:', allResults.length);
          console.log('Direct match IDs:', directMatches.map(o => o.id));
        }
        
        // Set direct match IDs for proper UI display
        setDirectMatchIds(new Set(directMatches.map(org => org.id)));
      }

      // Sort results by relevance
      allResults.sort((a, b) => {
        const aIsDirectMatch = directMatches.some(match => match.id === a.id);
        const bIsDirectMatch = directMatches.some(match => match.id === b.id);
        
        // For medical searches, always prioritize actual medical providers
        if (normalizedQuery === 'doctor' || normalizedQuery === 'medical' || normalizedQuery === 'physician' || normalizedQuery === 'healthcare') {
          const aName = a.organizationName.toLowerCase();
          const bName = b.organizationName.toLowerCase();
          const aServices = (a.servicesOffered || '').toLowerCase();
          const bServices = (b.servicesOffered || '').toLowerCase();
          const aCategory = a.category.toLowerCase();
          const bCategory = b.category.toLowerCase();
          
          // Calculate medical relevance scores
          const getMedicalScore = (name: string, services: string, category: string, isDirectMatch: boolean) => {
            let score = 0;
            
            // Direct text matches get a small boost, but not overwhelming
            if (isDirectMatch) score += 2;
            
            // Highest priority - actual medical facilities
            if (name.includes('hospital')) score += 20;
            if (name.includes('health') && name.includes('practice')) score += 20;
            if (name.includes('clinic') && !name.includes('behavioral')) score += 18;
            if (name.includes('medical') && name.includes('center')) score += 18;
            if (category === 'healthcare services') score += 15;
            
            // High priority medical services
            if (services.includes('primary care')) score += 15;
            if (services.includes('urgent care')) score += 15;
            if (services.includes('emergency care')) score += 14;
            if (services.includes('medical services')) score += 12;
            if (services.includes('acute care')) score += 12;
            
            // Medium priority - related medical
            if (name.includes('pharmacy')) score += 5;
            if (name.includes('behavioral') && name.includes('healthcare')) score += 4;
            if (name.includes('mental') && services.includes('medical')) score += 4;
            
            // Heavily deprioritize non-medical services
            if (name.includes('support group') || name.includes('support groups')) score -= 20;
            if (services.includes('support group') || services.includes('support for')) score -= 15;
            if (name.includes('caregiver') && name.includes('support')) score -= 20;
            if (name.includes('job seeker')) score -= 30;
            if (name.includes('sorority') || name.includes('fraternity')) score -= 30;
            if (name.includes('foundation') && !services.includes('medical')) score -= 25;
            if (name.includes('college') && !name.includes('medical')) score -= 25;
            if (name.includes('chapter') || name.includes('alumnae')) score -= 30;
            if (category === 'community services' && !services.includes('medical')) score -= 10;
            if (category === 'education' && !services.includes('medical')) score -= 20;
            
            return score;
          };
          
          const aScore = getMedicalScore(aName, aServices, aCategory, aIsDirectMatch);
          const bScore = getMedicalScore(bName, bServices, bCategory, bIsDirectMatch);
          
          // Always sort by medical score for medical searches
          if (aScore !== bScore) return bScore - aScore;
        } else if (normalizedQuery.includes('depressed') || normalizedQuery.includes('sad') || 
                   normalizedQuery.includes('anxious') || normalizedQuery.includes('mental') ||
                   normalizedQuery.includes('suicide') || normalizedQuery.includes('stressed') ||
                   normalizedQuery.includes('dying') || normalizedQuery.includes('die') ||
                   normalizedQuery.includes('hopeless') || normalizedQuery.includes('worthless') ||
                   normalizedQuery.includes('anxiety') || normalizedQuery.includes('depression') ||
                   normalizedQuery.includes('bipolar') || normalizedQuery.includes('ptsd') ||
                   normalizedQuery.includes('ocd') || normalizedQuery.includes('adhd') ||
                   normalizedQuery.includes('panic') || normalizedQuery.includes('trauma')) {
          // For mental health searches, prioritize mental health services
          const getMentalHealthScore = (org: Organization) => {
            let score = 0;
            const name = org.organizationName.toLowerCase();
            const services = (org.servicesOffered || '').toLowerCase();
            const category = org.category.toLowerCase();
            
            // Highest priority - suicide/crisis hotlines (especially for suicide-related queries)
            if (normalizedQuery.includes('dying') || normalizedQuery.includes('die') || 
                normalizedQuery.includes('suicide') || normalizedQuery.includes('kill')) {
              // Extreme priority for suicide prevention resources
              if (name.includes('suicide prevention') || name.includes('988')) score += 200;
              if (name.includes('crisis') && (name.includes('hotline') || name.includes('text'))) score += 180;
              if (services.includes('crisis') && services.includes('24')) score += 150; // 24-hour crisis services
            } else {
              // Normal priority for other mental health queries
              if (name.includes('suicide prevention') || name.includes('988')) score += 100;
              if (name.includes('crisis') && (name.includes('hotline') || name.includes('text'))) score += 90;
            }
            
            // High priority - mental health specific services
            if (name.includes('mental health') || name.includes('behavioral health')) score += 50;
            if (name.includes('counseling') || name.includes('therapy')) score += 45;
            if (name.includes('psychiatric') || name.includes('psychiatry')) score += 45;
            if (services.includes('mental health treatment')) score += 40;
            if (services.includes('depression') || services.includes('anxiety')) score += 40;
            if (name.includes('carter clinic')) score += 40; // Known mental health provider
            
            // Bonus points for organizations that specifically mention the searched condition
            const orgText = `${name} ${services}`.toLowerCase();
            if (normalizedQuery.includes('anxiety') && orgText.includes('anxiety')) score += 30;
            if (normalizedQuery.includes('depression') && orgText.includes('depression')) score += 30;
            if (normalizedQuery.includes('bipolar') && orgText.includes('bipolar')) score += 30;
            if (normalizedQuery.includes('ptsd') && orgText.includes('ptsd')) score += 30;
            if (normalizedQuery.includes('adhd') && orgText.includes('adhd')) score += 30;
            if (normalizedQuery.includes('ocd') && orgText.includes('ocd')) score += 30;
            
            // Medium priority - integrated care with mental health
            if (name.includes('integrated care') && services.includes('mental')) score += 30;
            if (services.includes('therapy') || services.includes('counseling')) score += 25;
            if (services.includes('behavioral health')) score += 25;
            
            // Bonus for integrated mental health and substance use services
            if (orgText.includes('mental health') && orgText.includes('substance')) score += 20;
            if (orgText.includes('co-occurring') || orgText.includes('dual diagnosis')) score += 25;
            
            // Lower priority - general crisis services
            if (category === 'crisis services' && !services.includes('mental')) score += 10;
            
            // Deprioritize unrelated services
            if (name.includes('domestic violence') && !normalizedQuery.includes('domestic')) score -= 50;
            if (name.includes('sexual assault') && !normalizedQuery.includes('sexual')) score -= 50;
            if (name.includes('district attorney') || name.includes('court')) score -= 40;
            // Don't deprioritize substance use services for mental health searches - they often co-occur
            if (name.includes('disaster') || name.includes('hurricane')) score -= 30;
            
            return score;
          };
          
          const aScore = getMentalHealthScore(a);
          const bScore = getMentalHealthScore(b);
          
          if (aScore !== bScore) return bScore - aScore;
        } else {
          // For non-medical searches, direct matches first
          if (aIsDirectMatch && !bIsDirectMatch) return -1;
          if (!aIsDirectMatch && bIsDirectMatch) return 1;
        }
        
        // Within same priority, name matches first
        const aNameMatch = a.organizationName.toLowerCase().includes(normalizedQuery);
        const bNameMatch = b.organizationName.toLowerCase().includes(normalizedQuery);
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        
        return 0;
      });

      setSearchResults(allResults);
      // directMatchIds already set above when we have category matches
    } else {
      // Reset emergency warning when search is empty
      setShowEmergencyWarning(false);
    }
  }, [searchParams, organizations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 rounded-lg w-96"></div>
            <div className="h-24 bg-gray-200 rounded-lg w-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Emergency Warning Banner */}
      {showEmergencyWarning && (
        <div className="bg-red-600 text-white py-6 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">If you're in immediate danger, please call 911 now</h2>
                <p className="text-lg mb-4">
                  Help is available. You are not alone.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="tel:911"
                    className="inline-flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call 911
                  </a>
                  <a
                    href="tel:988"
                    className="inline-flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call 988 (Suicide & Crisis Lifeline)
                  </a>
                  <a
                    href="sms:988"
                    className="inline-flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Text 988
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isVoiceSearch ? 'Voice Search Results' : 'Search Results'}
          </h1>
          <p className="text-lg text-gray-600">
            {searchResults.length > 0 
              ? (
                <>
                  {directMatchIds.size > 0 ? (
                    <>
                      Found {directMatchIds.size} direct match{directMatchIds.size !== 1 ? 'es' : ''} for "{searchQuery}"
                      {searchResults.length > directMatchIds.size && (
                        <span className="text-sm"> (showing {searchResults.length - directMatchIds.size} related resources too)</span>
                      )}
                    </>
                  ) : (
                    <>Found {searchResults.length} resource{searchResults.length !== 1 ? 's' : ''} related to "{searchQuery}"</>
                  )}
                </>
              )
              : `No results found for "${searchQuery}"`
            }
          </p>
        </div>

        {searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((org, index) => {
              const isDirectMatch = directMatchIds.has(org.id);
              const prevIsDirectMatch = index > 0 ? directMatchIds.has(searchResults[index - 1].id) : true;
              const showSimilarDivider = !isDirectMatch && prevIsDirectMatch && directMatchIds.size > 0;
              
              return (
                <div key={org.id}>
                  {showSimilarDivider && (
                    <div className="my-8 relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-gray-50 text-gray-500 font-medium">Related resources</span>
                      </div>
                    </div>
                  )}
                  <div
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">
                          {org.organizationName}
                        </h2>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-xl">{CATEGORY_ICONS[org.category as keyof typeof CATEGORY_ICONS] || '📍'}</span>
                          <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${CATEGORY_COLORS[org.category as keyof typeof CATEGORY_COLORS] || 'bg-gray-500'}`}>
                            {org.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{org.address}</span>
                  </p>
                  {org.phone && (
                    <p className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${org.phone.replace(/\D/g, '')}`} className="text-blue-600 hover:underline">
                        {org.phone}
                      </a>
                    </p>
                  )}
                  {org.servicesOffered && (
                    <p className="mt-2">
                      <strong>Services:</strong> {org.servicesOffered}
                    </p>
                  )}
                    </div>

                    <div className="flex gap-3">
                  <Link
                    href={`/map?org=${encodeURIComponent(org.id)}`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    View on Map
                  </Link>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(org.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-center"
                  >
                    Directions
                  </a>
                  {org.phone && (
                    <a
                      href={`tel:${org.phone.replace(/\D/g, '')}`}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-center"
                    >
                      Call Now
                    </a>
                  )}
                  {org.website && (
                    <a
                      href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center"
                    >
                      Website
                    </a>
                  )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No results found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find any organizations matching "{searchQuery}". Try searching for a different term or browse by category.
            </p>
            <div className="space-y-3">
              {isVoiceSearch && (
                <button
                  onClick={() => router.push('/')}
                  className="block w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  🎤 Try Voice Search Again
                </button>
              )}
              <Link
                href="/categories"
                className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse by Category
              </Link>
              <Link
                href="/"
                className="block w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Voice search tip */}
        {isVoiceSearch && searchResults.length === 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-4">
              <strong>Tip:</strong> Try saying the organization name more clearly, or search by the type of service you need 
              (like "food", "healthcare", or "housing").
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Voice Search Again
            </button>
          </div>
        )}
        
        {/* Back button at bottom */}
        {searchResults.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>
        )}
      </div>
      
      {/* Feedback Banner */}
      <FeedbackBanner />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 rounded-lg w-96"></div>
            <div className="h-24 bg-gray-200 rounded-lg w-96"></div>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}