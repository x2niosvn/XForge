import React, { useState, useCallback, useEffect, useRef } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { CurseForgeSubTabs } from '../SubTabs.jsx'
import { ModFilters } from '../ModFilters.jsx'
import { ModGrid } from '../ModGrid.jsx'
import { ModDetail } from '../ModDetail.jsx'
import ViewToggle from '../ViewToggle.jsx'
import LoadingOverlay from '../LoadingOverlay.jsx'
import { useCurseForgeSearch } from './useCurseForge.js'
import { useModrinthGameVersions } from '../modrinth/useModrinth.js'

const DEFAULT_FILTERS = {
  query: '',
  contentType: 'mods',
  sortBy: 'relevance',
  gameVersions: [],
  loaders: [],
  categories: [],
}

export default function CurseForgeTab({ selectedProfileId, pageContext, onDetailStateChange }) {
  const [filters, setFilters] = useState(() => {
    if (pageContext?.loader || pageContext?.gameVersion) {
      return {
        ...DEFAULT_FILTERS,
        loaders: pageContext.loader ? [pageContext.loader] : [],
        gameVersions: pageContext.gameVersion ? [pageContext.gameVersion] : [],
      }
    }
    return DEFAULT_FILTERS
  })
  const [view, setView] = useState('grid')
  const [selectedProject, setSelectedProject] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [tabLoading, setTabLoading] = useState(false)
  const tabLoadingTimer = useRef(null)

  useEffect(() => {
    onDetailStateChange?.(!!selectedProject)
    return () => onDetailStateChange?.(false)
  }, [selectedProject, onDetailStateChange])

  useEffect(() => {
    if (pageContext) {
      setFilters(prev => ({
        ...prev,
        loaders: pageContext.loader ? [pageContext.loader] : [],
        gameVersions: pageContext.gameVersion ? [pageContext.gameVersion] : [],
      }))
    } else {
      setFilters(DEFAULT_FILTERS)
    }
    setSelectedProject(null)
  }, [pageContext])

  const { results, total, loading, error, loadMore, hasMore } = useCurseForgeSearch(filters)
  const gameVersions = useModrinthGameVersions()

  useEffect(() => {
    if (!loading && tabLoading) {
      tabLoadingTimer.current = setTimeout(() => setTabLoading(false), 120)
    }
    return () => clearTimeout(tabLoadingTimer.current)
  }, [loading, tabLoading])

  function updateFilters(patch) {
    setFilters(prev => ({ ...prev, ...patch }))
    setSelectedProject(null)
  }

  function handleSubTab(type) {
    setTabLoading(true)
    setSelectedProject(null)
    setSearchInput('')
    setFilters(prev => ({ ...prev, contentType: type, query: '' }))
  }

  function handleSearch(e) {
    e.preventDefault()
    updateFilters({ query: searchInput })
  }

  function handleSelectProject(mod) {
    setSelectedProject({ id: mod.id, type: filters.contentType })
  }

  if (selectedProject) {
    return (
      <ModDetail
        projectId={selectedProject.id}
        projectType={selectedProject.type}
        platform="curseforge"
        onBack={() => setSelectedProject(null)}
        selectedProfileId={selectedProfileId}
      />
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden min-w-0">
      <div className="flex-shrink-0 px-4 pt-3 pb-2 space-y-2">
        <CurseForgeSubTabs active={filters.contentType} onChange={handleSubTab} />

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-fgfaint pointer-events-none"
            />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder={`Tìm kiếm trên CurseForge...`}
              className="w-full pl-9 pr-4 py-2 text-sm bg-bg2 rounded-lg ring-1 ring-line text-fg placeholder:text-fgfaint focus:outline-none focus:ring-accent/50 transition-colors"
            />
          </div>
          <ViewToggle view={view} onChange={setView} />
        </form>

        <div className="flex items-center justify-center min-h-[18px]">
          {loading ? (
            <div className="w-full h-0.5 bg-bg2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, #fb923c 40%, #f97316 60%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer-bar 1.4s linear infinite',
                  width: '100%',
                }}
              />
            </div>
          ) : total > 0 ? (
            <p className="text-xs text-fgfaint">
              {total.toLocaleString()} kết quả
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-w-0">
        <ModFilters
          filters={filters}
          onChange={updateFilters}
          platform="curseforge"
          gameVersions={gameVersions}
          availableLoaders={['forge', 'fabric']}
          lockFilters={!!pageContext}
        />

        <div className="flex-1 overflow-hidden p-2 relative">
          <LoadingOverlay visible={tabLoading} />
          <div className="h-full overflow-y-auto">
            {error && (
              <div className="text-center text-red-400 py-8">
                Lỗi: {error}
              </div>
            )}
            <ModGrid
              mods={results}
              view={view}
              onSelect={handleSelectProject}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={loadMore}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
