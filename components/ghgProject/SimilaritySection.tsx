'use client'

import { useState, useEffect } from 'react'
import Section from './Section'
import { useSimilarityData } from '@/hooks/useSimilarityData'
import { Card } from '@/components/ui/Card'

// Get available states from API or use common ones
const commonStates = ['CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'MI', 'GA', 'NC']

export default function SimilaritySection() {
  const [selectedState, setSelectedState] = useState('CA')
  const { data: similarityData, loading } = useSimilarityData(selectedState)

  return (
    <Section id="similarity">
      <div className="space-y-8">
        <h2 className="text-4xl font-bold text-accent-primary">State Emission Profile Similarity</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <label className="block text-text-secondary mb-2">Select State:</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-bg-card border border-accent-primary/30 rounded-md px-4 py-2 text-text-primary focus:outline-none focus:border-accent-primary"
              >
                {commonStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-accent-teal">Most Similar States</h3>
              {loading ? (
                <div className="h-48 flex items-center justify-center text-text-secondary">Loading similarity data...</div>
              ) : similarityData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-text-secondary">No similarity data available</div>
              ) : (
                similarityData.map((item, index) => (
                <Card
                  key={item.state}
                  variant="teal"
                  className="flex items-center gap-4 p-4"
                >
                  <div className="text-2xl text-accent-primary">{selectedState}</div>
                  <div className="text-text-secondary">↔</div>
                  <div className="text-2xl text-accent-teal">{item.state}</div>
                  <div className="ml-auto text-accent-primary font-bold">{item.score.toFixed(2)}</div>
                </Card>
                ))
              )}
            </div>
          </div>
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-accent-primary mb-4">Methodology</h3>
            <div className="space-y-4 text-text-secondary">
              <p>
                <strong className="text-accent-primary">Cosine Similarity:</strong> I computed cosine 
                similarity on state-level feature vectors to identify states with similar emission profiles.
              </p>
              <p>
                <strong className="text-accent-primary">Features Used:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Total emissions per state</li>
                <li>Mean emissions per facility</li>
                <li>Gas composition shares (CO₂, CH₄, N₂O percentages)</li>
                <li>Sector mix (distribution across industry sectors)</li>
              </ul>
              <p className="mt-4">
                <strong className="text-accent-primary">Interpretation:</strong> I found that a similarity score close 
                to 1.0 indicates that two states have very similar emission profiles in terms of the 
                features above, even if their absolute emission totals differ. My analysis helps identify 
                states that may face similar challenges or benefit from similar policy approaches.
              </p>
              {similarityData.length > 0 && (
                <p className="text-sm text-text-muted mt-4">
                  <strong>Example:</strong> I found that {selectedState}&apos;s profile is most similar to {similarityData[0]?.state || 'other states'}, 
                  suggesting these states share characteristics such as diverse sector mix and relatively 
                  balanced gas composition, despite different absolute emission levels.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Section>
  )
}

