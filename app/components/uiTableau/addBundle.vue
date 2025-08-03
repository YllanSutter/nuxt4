<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'

const {
  nameBundle,
  numberGames,
  priceBundle,
  createElem,
  validateBundleData,
  resetForm
} = useBundleActions()

const handleCreateElem = async (cible:string) => {
  const validation = validateBundleData()
  
  if (!validation.isValid) {
    console.warn('⚠️ Erreurs de validation:', validation.errors)
    return
  }
  
  try {
    await createElem(cible)
    console.log('✅ Bundle créé avec succès!')
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error)
  }
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline"> <Icon name="stash:list-add" /> Add a bundle</Button>
    </PopoverTrigger>
    <PopoverContent class="w-80">
      <div class="grid gap-4">
        <div class="space-y-2">
          <h4 class="font-medium leading-none">Add a bundle</h4>
          <p class="text-sm text-muted-foreground">
            Or you can import one (WIP)
          </p>
        </div>
        <div class="grid gap-2">
          <div class="grid grid-cols-3 items-center gap-4">
            <label class="text-sm font-medium">Name</label>
            <Input
              type="text"
              v-model="nameBundle"
              placeholder="Bundle Name"
              class="col-span-2"
            />
          </div>
          <div class="grid grid-cols-3 items-center gap-4">
            <label class="text-sm font-medium">Games</label>
            <Input
              type="number"
              placeholder="5"
              class="col-span-2"
              v-model="numberGames"
            />
          </div>
          <div class="grid grid-cols-3 items-center gap-4">
            <label class="text-sm font-medium">Price</label>
            <Input
              type="number"
              placeholder="5"
              class="col-span-2"
              v-model="priceBundle"
            />
          </div>
          <Button @click="handleCreateElem('bundle')">Create</Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
