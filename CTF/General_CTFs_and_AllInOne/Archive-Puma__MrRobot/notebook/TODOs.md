# 🔧 Implementations

## Design

- [x] Show banner
- [x] Implement colors
- [ ] Colors can be disabled
- [ ] Implement spinners?

## Architecture

- [x] Units should be autoimported
- [x] A single unit can be run
- [x] Running selected categories
- [ ] Units can implement custom arguments
- [x] All units must inherit from a template
- [x] Units can be disabled if their name start with an underscore

## Performance

- [ ] Decompress challenges 
- [x] It is necessary to implement multiprocessing
- [ ] Multiprocessing is executed through priorities
- [x] When a process ends successfully, everyone ends
- [x] It must be possible to run using an *inside* search method: `FLAG{challenge}`
- [x] Should be a *show all results* option

## Refractor & Bugs

- [x] Check imports
- [ ] Create new UnitBase method to convert always to bytes
- [x] PIL check if is an image
- [x] Create --safe to units that generates a lot of false positives
