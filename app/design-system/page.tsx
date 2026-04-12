"use client"

import React from "react"
import {
  Tile,
  ClickableTile,
  SelectableTile,
  ExpandableTile
} from "@/components/ui/carbon-tile"
import { Tag, TagGroup } from "@/components/ui/carbon-tag"
import { Notification } from "@/components/ui/carbon-notification"
import { DataTable, type Column } from "@/components/ui/carbon-data-table"
import {
  LoadingSpinner,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  LoadingOverlay,
  LoadingBar,
} from "@/components/ui/carbon-loading"
import { IconButton, IconButtonGroup } from "@/components/ui/carbon-icon-button"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  Heart,
  Share2,
  Bookmark,
  Edit,
  Trash2,
  Download,
  Play,
  Pause,
  SkipForward,
} from "lucide-react"

// Types pour le DataTable
interface ExampleData {
  id: number
  name: string
  status: string
  role: string
  location: string
}

export default function DesignSystemPage() {
  const [selectedTiles, setSelectedTiles] = React.useState<Set<number>>(new Set())
  const [showNotification, setShowNotification] = React.useState(true)
  const [isLoading, setIsLoading] = React.useState(false)
  const [loadingProgress, setLoadingProgress] = React.useState(0)

  // Données pour le DataTable
  const tableData: ExampleData[] = [
    { id: 1, name: "Marie Dupont", status: "Actif", role: "Développeur", location: "Paris" },
    { id: 2, name: "Jean Martin", status: "Inactif", role: "Designer", location: "Lyon" },
    { id: 3, name: "Sophie Bernard", status: "Actif", role: "Chef de projet", location: "Marseille" },
    { id: 4, name: "Pierre Dubois", status: "Actif", role: "Développeur", location: "Toulouse" },
    { id: 5, name: "Isabelle Petit", status: "Inactif", role: "Designer", location: "Nice" },
  ]

  const columns: Column<ExampleData>[] = [
    {
      key: "name",
      header: "Nom",
      accessor: (row) => row.name,
      sortable: true,
    },
    {
      key: "status",
      header: "Statut",
      accessor: (row) => (
        <Tag variant={row.status === "Actif" ? "green" : "gray"} size="sm">
          {row.status}
        </Tag>
      ),
      sortable: true,
    },
    {
      key: "role",
      header: "Rôle",
      accessor: (row) => row.role,
      sortable: true,
    },
    {
      key: "location",
      header: "Localisation",
      accessor: (row) => row.location,
      sortable: true,
    },
  ]

  const handleToggleTile = (index: number) => {
    const newSelected = new Set(selectedTiles)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedTiles(newSelected)
  }

  const simulateLoading = () => {
    setIsLoading(true)
    setLoadingProgress(0)

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsLoading(false)
          return 0
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container-custom">
          <h1 className="text-display-sm mb-4">Design System</h1>
          <p className="text-body-lg max-w-3xl">
            Éléments graphiques différenciants combinant IBM Carbon Design System et shadcn/ui
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-12 space-y-16">

        {/* Section: Carbon Tiles */}
        <section>
          <h2 className="text-h2 mb-6">Carbon Tiles</h2>
          <div className="space-y-8">

            {/* Default Tiles */}
            <div>
              <h3 className="text-h4 mb-4">Tuiles par défaut</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Tile>
                  <h4 className="font-semibold mb-2">Tuile standard</h4>
                  <p className="text-sm text-muted-foreground">
                    Une tuile simple pour afficher du contenu statique.
                  </p>
                </Tile>

                <Tile variant="ghost">
                  <h4 className="font-semibold mb-2">Tuile Ghost</h4>
                  <p className="text-sm text-muted-foreground">
                    Sans bordure, avec effet hover subtil.
                  </p>
                </Tile>

                <Tile padding="lg">
                  <h4 className="font-semibold mb-2">Tuile Large Padding</h4>
                  <p className="text-sm text-muted-foreground">
                    Plus d'espace pour respirer.
                  </p>
                </Tile>
              </div>
            </div>

            {/* Clickable Tiles */}
            <div>
              <h3 className="text-h4 mb-4">Tuiles cliquables</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ClickableTile onClick={() => alert("Tuile cliquée!")}>
                  <h4 className="font-semibold mb-2">Action Rapide</h4>
                  <p className="text-sm text-muted-foreground">
                    Cliquez pour déclencher une action
                  </p>
                </ClickableTile>

                <ClickableTile href="#" as="a">
                  <h4 className="font-semibold mb-2">Lien Navigation</h4>
                  <p className="text-sm text-muted-foreground">
                    Navigue vers une autre page
                  </p>
                </ClickableTile>
              </div>
            </div>

            {/* Selectable Tiles */}
            <div>
              <h3 className="text-h4 mb-4">Tuiles sélectionnables</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => (
                  <SelectableTile
                    key={index}
                    selected={selectedTiles.has(index)}
                    onSelectedChange={() => handleToggleTile(index)}
                  >
                    <h4 className="font-semibold mb-2">Option {index + 1}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedTiles.has(index) ? "✓ Sélectionnée" : "Cliquez pour sélectionner"}
                    </p>
                  </SelectableTile>
                ))}
              </div>
            </div>

            {/* Expandable Tile */}
            <div>
              <h3 className="text-h4 mb-4">Tuile expandable</h3>
              <ExpandableTile
                title={
                  <div>
                    <h4 className="font-semibold">Détails du projet</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cliquez pour voir plus d'informations
                    </p>
                  </div>
                }
              >
                <div className="space-y-3">
                  <p className="text-sm">
                    Voici des informations détaillées sur le projet. Vous pouvez y placer
                    n'importe quel contenu : texte, images, formulaires, etc.
                  </p>
                  <TagGroup>
                    <Tag variant="blue">React</Tag>
                    <Tag variant="green">TypeScript</Tag>
                    <Tag variant="yellow">Next.js</Tag>
                  </TagGroup>
                </div>
              </ExpandableTile>
            </div>
          </div>
        </section>

        {/* Section: Tags */}
        <section>
          <h2 className="text-h2 mb-6">Carbon Tags</h2>
          <div className="space-y-6">

            <div>
              <h3 className="text-h4 mb-4">Variantes de couleurs</h3>
              <TagGroup>
                <Tag variant="default">Default</Tag>
                <Tag variant="red">Erreur</Tag>
                <Tag variant="green">Succès</Tag>
                <Tag variant="blue">Info</Tag>
                <Tag variant="yellow">Attention</Tag>
                <Tag variant="gray">Neutre</Tag>
                <Tag variant="outline">Outline</Tag>
              </TagGroup>
            </div>

            <div>
              <h3 className="text-h4 mb-4">Tailles</h3>
              <div className="flex items-center gap-3">
                <Tag size="sm">Small</Tag>
                <Tag size="default">Default</Tag>
                <Tag size="lg">Large</Tag>
              </div>
            </div>

            <div>
              <h3 className="text-h4 mb-4">Tags dismissibles</h3>
              <TagGroup>
                <Tag variant="blue" dismissible onDismiss={() => console.log("Dismissed")}>
                  React
                </Tag>
                <Tag variant="green" dismissible onDismiss={() => console.log("Dismissed")}>
                  TypeScript
                </Tag>
                <Tag variant="yellow" dismissible onDismiss={() => console.log("Dismissed")}>
                  Next.js
                </Tag>
              </TagGroup>
            </div>
          </div>
        </section>

        {/* Section: Notifications */}
        <section>
          <h2 className="text-h2 mb-6">Carbon Notifications</h2>
          <div className="space-y-4">

            {showNotification && (
              <Notification
                variant="info"
                title="Information"
                subtitle="Ceci est une notification d'information"
                onDismiss={() => setShowNotification(false)}
              />
            )}

            <Notification
              variant="success"
              title="Succès"
              subtitle="Votre action a été effectuée avec succès"
              dismissible={false}
              action={{ label: "Voir détails", onClick: () => console.log("Action") }}
            />

            <Notification
              variant="warning"
              title="Attention"
              subtitle="Certaines données nécessitent votre attention"
            />

            <Notification
              variant="error"
              title="Erreur"
              subtitle="Une erreur s'est produite lors du traitement"
            />
          </div>
        </section>

        {/* Section: Data Table */}
        <section>
          <h2 className="text-h2 mb-6">Carbon Data Table</h2>
          <Card>
            <CardHeader>
              <CardTitle>Liste des utilisateurs</CardTitle>
              <CardDescription>
                Tableau de données avec tri, zebra stripes et hover states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={tableData}
                zebra
                hoverable
                stickyHeader={false}
              />
            </CardContent>
          </Card>
        </section>

        {/* Section: Loading States */}
        <section>
          <h2 className="text-h2 mb-6">Loading States & Skeletons</h2>
          <div className="space-y-8">

            {/* Spinners */}
            <div>
              <h3 className="text-h4 mb-4">Loading Spinners</h3>
              <div className="flex items-center gap-6">
                <LoadingSpinner size="sm" />
                <LoadingSpinner size="default" />
                <LoadingSpinner size="lg" />
                <LoadingSpinner size="xl" />
              </div>
            </div>

            {/* Loading Bar */}
            <div>
              <h3 className="text-h4 mb-4">Loading Bar</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-2">Progression: {loadingProgress}%</p>
                  <LoadingBar progress={loadingProgress} />
                </div>
                <div>
                  <p className="text-sm mb-2">Indéterminée:</p>
                  <LoadingBar />
                </div>
                <Button onClick={simulateLoading} disabled={isLoading}>
                  {isLoading ? "Chargement..." : "Simuler chargement"}
                </Button>
              </div>
            </div>

            {/* Skeletons */}
            <div>
              <h3 className="text-h4 mb-4">Skeletons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm mb-2 font-medium">Texte</p>
                  <SkeletonText lines={4} />
                </div>
                <div>
                  <p className="text-sm mb-2 font-medium">Card</p>
                  <SkeletonCard />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm mb-2 font-medium">Table</p>
                <SkeletonTable rows={5} columns={4} />
              </div>
            </div>

            {/* Loading Overlay */}
            <div>
              <h3 className="text-h4 mb-4">Loading Overlay</h3>
              <LoadingOverlay loading={isLoading}>
                <Card>
                  <CardHeader>
                    <CardTitle>Contenu avec overlay</CardTitle>
                    <CardDescription>
                      Cliquez sur "Simuler chargement" ci-dessus pour voir l'overlay
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Ce contenu sera couvert par un overlay de chargement pendant le chargement.
                    </p>
                  </CardContent>
                </Card>
              </LoadingOverlay>
            </div>
          </div>
        </section>

        {/* Section: Icon Buttons */}
        <section>
          <h2 className="text-h2 mb-6">Carbon Icon Buttons</h2>
          <div className="space-y-6">

            <div>
              <h3 className="text-h4 mb-4">Variantes</h3>
              <div className="flex items-center gap-3">
                <IconButton icon={<Heart />} label="J'aime" variant="default" />
                <IconButton icon={<Share2 />} label="Partager" variant="ghost" />
                <IconButton icon={<Bookmark />} label="Sauvegarder" variant="outline" />
                <IconButton icon={<Trash2 />} label="Supprimer" variant="destructive" />
              </div>
            </div>

            <div>
              <h3 className="text-h4 mb-4">Tailles</h3>
              <div className="flex items-center gap-3">
                <IconButton icon={<Edit />} label="Éditer" size="sm" />
                <IconButton icon={<Edit />} label="Éditer" size="default" />
                <IconButton icon={<Edit />} label="Éditer" size="lg" />
              </div>
            </div>

            <div>
              <h3 className="text-h4 mb-4">Groupes de boutons</h3>
              <IconButtonGroup attached>
                <IconButton icon={<Play />} label="Lecture" variant="outline" />
                <IconButton icon={<Pause />} label="Pause" variant="outline" />
                <IconButton icon={<SkipForward />} label="Suivant" variant="outline" />
              </IconButtonGroup>
            </div>

            <div>
              <h3 className="text-h4 mb-4">Groupe vertical</h3>
              <IconButtonGroup orientation="vertical" attached>
                <IconButton icon={<Download />} label="Télécharger" variant="outline" />
                <IconButton icon={<Share2 />} label="Partager" variant="outline" />
                <IconButton icon={<Bookmark />} label="Sauvegarder" variant="outline" />
              </IconButtonGroup>
            </div>
          </div>
        </section>

        {/* Section: Carbon Grid */}
        <section>
          <h2 className="text-h2 mb-6">Carbon Grid (16 colonnes)</h2>
          <div className="carbon-grid-narrow">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="bg-primary/20 border border-primary p-4 text-center text-sm font-mono"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </section>

        {/* Section: Layers */}
        <section>
          <h2 className="text-h2 mb-6">Carbon Layers</h2>
          <div className="space-y-4">
            <Tile className="layer-01">
              <h4 className="font-semibold mb-2">Layer 01</h4>
              <p className="text-sm text-muted-foreground">Couche de base</p>
            </Tile>
            <Tile className="layer-02">
              <h4 className="font-semibold mb-2">Layer 02</h4>
              <p className="text-sm text-muted-foreground">Couche élevée</p>
            </Tile>
            <Tile className="layer-03">
              <h4 className="font-semibold mb-2">Layer 03</h4>
              <p className="text-sm text-muted-foreground">Couche la plus élevée</p>
            </Tile>
          </div>
        </section>

      </div>
    </div>
  )
}
