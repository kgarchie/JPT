<template>
    <div id="wrapper">
        <section>
            <nav class="navbar floating">
                <div class="start">
                    <div class="nav-item">
                        <div class="logo">JPT</div>
                    </div>
                </div>
                <div class="mid">
                    <div class="nav-item">
                        <a href="" class="nav-link">Help</a>
                    </div>
                    <div class="nav-item">
                        <div class="nav-link">More</div>
                    </div>
                </div>
                <div class="end">
                    <div class="nav-item">
                        <div class="buttons">
                            <button>Logout</button>
                            <button>Login</button>
                        </div>
                    </div>
                </div>
            </nav>
        </section>
        <section class="mt-1">
            <main>
                <slot></slot>
            </main>
        </section>
        <section>
            <footer></footer>
        </section>
    </div>
</template>
<script setup lang="ts">

</script>
<style scoped>
</style>