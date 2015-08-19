<?php

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     *
     * @return void
     */
    public function testLoggedOutUser()
    {
        $this->visit('/')
             ->see('Log in with Pocket');
    }
}
